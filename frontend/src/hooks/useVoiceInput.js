import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const useVoiceInput = (onResult, options = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  const {
    language = 'en-US',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
    cannabisMode = false,
    timeout = 10000 // 10 seconds default timeout
  } = options;

  // Cannabis-specific vocabulary and patterns
  const cannabisVocabulary = {
    // Growth stages
    'seedling': ['seedling', 'seed', 'sprout'],
    'vegetative': ['vegetative', 'veg', 'vegging', 'vegetation'],
    'flowering': ['flowering', 'flower', 'bloom', 'blooming'],
    'harvest': ['harvest', 'harvesting', 'ready'],

    // Strain types
    'indica': ['indica', 'in dica'],
    'sativa': ['sativa', 'sa tiva'],
    'hybrid': ['hybrid', 'cross'],

    // Training techniques
    'lst': ['lst', 'low stress training', 'low stress'],
    'hst': ['hst', 'high stress training', 'high stress'],
    'topping': ['topping', 'top'],
    'scrog': ['scrog', 'screen of green', 'screen'],
    'sog': ['sog', 'sea of green'],

    // Common strain names
    'blue dream': ['blue dream', 'blue', 'dream'],
    'og kush': ['og kush', 'og', 'kush'],
    'white widow': ['white widow', 'widow'],
    'northern lights': ['northern lights', 'northern'],
    'jack herer': ['jack herer', 'jack'],
    'girl scout cookies': ['girl scout cookies', 'gsc', 'cookies'],

    // Measurements
    'fahrenheit': ['fahrenheit', 'degrees fahrenheit', 'f'],
    'celsius': ['celsius', 'degrees celsius', 'c'],
    'percent': ['percent', '%'],
    'ppm': ['ppm', 'parts per million'],
    'ph': ['ph', 'p h'],
    'ec': ['ec', 'e c'],
    'vpd': ['vpd', 'v p d'],
    'ppfd': ['ppfd', 'p p f d']
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);

        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.maxAlternatives = maxAlternatives;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);

          // Set timeout to automatically stop listening
          if (timeout > 0) {
            timeoutRef.current = setTimeout(() => {
              stopListening();
              toast('Voice input timed out', { icon: '⏰' });
            }, timeout);
          }
        };

        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            const processedText = cannabisMode ?
              processCannabisText(finalTranscript) :
              finalTranscript.trim();

            onResult(processedText, {
              confidence: event.results[event.results.length - 1][0].confidence,
              isFinal: true,
              raw: finalTranscript
            });

            // Auto-stop after getting final result (unless continuous mode)
            if (!continuous) {
              stopListening();
            }
          } else if (interimResults && interimTranscript) {
            const processedText = cannabisMode ?
              processCannabisText(interimTranscript) :
              interimTranscript.trim();

            onResult(processedText, {
              confidence: event.results[event.results.length - 1][0].confidence,
              isFinal: false,
              raw: interimTranscript
            });
          }
        };

        recognition.onerror = (event) => {
          let errorMessage = 'Voice recognition error';

          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech detected. Please try again.';
              break;
            case 'audio-capture':
              errorMessage = 'Microphone not available. Please check permissions.';
              break;
            case 'not-allowed':
              errorMessage = 'Microphone access denied. Please allow microphone access.';
              break;
            case 'network':
              errorMessage = 'Network error. Voice recognition requires internet connection.';
              break;
            case 'language-not-supported':
              errorMessage = 'Language not supported for voice recognition.';
              break;
            default:
              errorMessage = `Voice recognition error: ${event.error}`;
          }

          setError(errorMessage);
          setIsListening(false);
          toast.error(errorMessage);

          // Clear timeout on error
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };

        recognition.onend = () => {
          setIsListening(false);

          // Clear timeout when recognition ends
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };

        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
        setError('Speech recognition not supported in this browser');
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [language, continuous, interimResults, maxAlternatives, onResult, cannabisMode, timeout]);

  // Process cannabis-specific text
  const processCannabisText = (text) => {
    let processedText = text.toLowerCase().trim();

    // Replace common cannabis vocabulary
    Object.entries(cannabisVocabulary).forEach(([canonical, variations]) => {
      variations.forEach(variation => {
        const regex = new RegExp(`\\b${variation}\\b`, 'gi');
        processedText = processedText.replace(regex, canonical);
      });
    });

    // Handle numeric values with units
    processedText = processedText
      .replace(/(\d+)\s*degrees?\s*fahrenheit/gi, '$1°F')
      .replace(/(\d+)\s*degrees?\s*celsius/gi, '$1°C')
      .replace(/(\d+)\s*percent/gi, '$1%')
      .replace(/(\d+\.?\d*)\s*p\s*h/gi, '$1')
      .replace(/(\d+)\s*p\s*p\s*m/gi, '$1')
      .replace(/(\d+\.?\d*)\s*e\s*c/gi, '$1')
      .replace(/(\d+\.?\d*)\s*v\s*p\s*d/gi, '$1')
      .replace(/(\d+)\s*p\s*p\s*f\s*d/gi, '$1');

    // Capitalize first letter
    return processedText.charAt(0).toUpperCase() + processedText.slice(1);
  };

  const startListening = () => {
    if (!isSupported) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    if (!recognitionRef.current || isListening) return;

    try {
      recognitionRef.current.start();
      toast('🎤 Listening... Speak now', { duration: 2000 });
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setError('Failed to start voice recognition');
      toast.error('Failed to start voice recognition');
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }

    // Clear timeout when manually stopping
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening
  };
};

export default useVoiceInput;
