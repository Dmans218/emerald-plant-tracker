# Story 1.6: Mobile-First Bulk Operations

## Story Information

- **Epic**: Bulk Data Management UX Enhancements
- **Story ID**: 1.6
- **Priority**: Medium
- **Estimated Points**: 13
- **Status**: Draft

## User Story

**As a** cannabis cultivator working in the grow room
**I want** touch-friendly bulk operations on mobile devices
**So that** I can manage data efficiently while working with plants

## Acceptance Criteria

- [ ] Swipe actions for bulk selection
- [ ] Long press for multi-select mode
- [ ] Touch-optimized bulk operation interface
- [ ] Gesture support for data range selection
- [ ] Voice command integration for basic operations
- [ ] All bulk operations work on mobile devices
- [ ] Touch interactions are responsive and intuitive
- [ ] Mobile interface maintains cannabis aesthetic

## Technical Requirements

### Frontend Components

- `MobileBulkSelector` touch-optimized selection component
- `SwipeActions` swipe gesture handlers
- `TouchRangeSelector` gesture-based range selection
- `VoiceCommandHandler` voice input integration
- `MobileBulkWizard` mobile-optimized wizard
- `TouchFeedback` haptic and visual feedback
- `MobileGestureManager` gesture state management

### Mobile-Specific Libraries

- `react-swipeable` - Swipe gesture handling
- `react-use-gesture` - Advanced gesture support
- `react-speech-recognition` - Voice command integration
- `@capacitor/haptics` - Haptic feedback (if using Capacitor)

### State Management

- Touch gesture state management
- Voice command processing
- Mobile-specific UI state
- Gesture conflict resolution

## Implementation Tasks

1. [ ] Create `MobileBulkSelector` component
2. [ ] Implement `SwipeActions` with cannabis-specific actions
3. [ ] Build `TouchRangeSelector` for date/record ranges
4. [ ] Add `VoiceCommandHandler` for hands-free operation
5. [ ] Create `MobileBulkWizard` optimized for touch
6. [ ] Implement `TouchFeedback` with haptic responses
7. [ ] Add gesture conflict resolution
8. [ ] Create mobile-specific bulk operation flows
9. [ ] Implement touch-optimized data tables
10. [ ] Add mobile-specific error handling
11. [ ] Create mobile gesture tutorials
12. [ ] Implement offline capability for mobile
13. [ ] Add mobile performance optimization
14. [ ] Write mobile-specific tests
15. [ ] Add accessibility features for mobile

## UI/UX Specifications

### Mobile Bulk Selector

```jsx
const MobileBulkSelector = ({ data, onSelectionChange }) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  
  const handleLongPress = (itemId) => {
    setIsMultiSelectMode(true);
    setSelectedItems(new Set([itemId]));
  };
  
  const handleSwipe = (itemId, direction) => {
    if (direction === 'left') {
      // Quick select
      setSelectedItems(prev => new Set([...prev, itemId]));
    } else if (direction === 'right') {
      // Quick deselect
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };
  
  return (
    <div className="mobile-bulk-selector">
      <div className="selection-mode-indicator">
        {isMultiSelectMode && (
          <div className="mode-banner bg-green-600 text-white p-2 text-center">
            Multi-Select Mode - Tap items to select
          </div>
        )}
      </div>
      
      <div className="data-list">
        {data.map(item => (
          <div
            key={item.id}
            className={`data-item ${selectedItems.has(item.id) ? 'selected' : ''}`}
            onTouchStart={() => handleLongPress(itemId)}
            onSwipe={(direction) => handleSwipe(item.id, direction)}
          >
            <div className="item-content">
              <span className="item-title">{item.title}</span>
              <span className="item-date">{formatDate(item.date)}</span>
            </div>
            
            {isMultiSelectMode && (
              <div className="selection-indicator">
                <Checkbox 
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleSelection(item.id)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mobile-actions">
        <Button 
          onClick={() => setIsMultiSelectMode(false)}
          className="bg-gray-600"
        >
          Exit Multi-Select
        </Button>
        <Button 
          onClick={() => onSelectionChange(Array.from(selectedItems))}
          className="bg-green-600"
        >
          Bulk Edit ({selectedItems.size})
        </Button>
      </div>
    </div>
  );
};
```

### Swipe Actions

```jsx
const SwipeActions = ({ item, onAction }) => {
  const swipeConfig = {
    left: [
      {
        text: 'Select',
        action: () => onAction('select', item.id),
        color: 'bg-green-500'
      },
      {
        text: 'Edit',
        action: () => onAction('edit', item.id),
        color: 'bg-blue-500'
      }
    ],
    right: [
      {
        text: 'Delete',
        action: () => onAction('delete', item.id),
        color: 'bg-red-500'
      },
      {
        text: 'Skip',
        action: () => onAction('skip', item.id),
        color: 'bg-gray-500'
      }
    ]
  };
  
  return (
    <Swipeable
      leftButtons={swipeConfig.left}
      rightButtons={swipeConfig.right}
      onSwipe={(direction, action) => {
        // Trigger haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        action();
      }}
    >
      <div className="swipeable-item">
        {/* Item content */}
      </div>
    </Swipeable>
  );
};
```

### Touch Range Selector

```jsx
const TouchRangeSelector = ({ onRangeSelect }) => {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setStartPoint({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleTouchMove = (e) => {
    if (startPoint) {
      const touch = e.touches[0];
      setEndPoint({ x: touch.clientX, y: touch.clientY });
    }
  };
  
  const handleTouchEnd = () => {
    if (startPoint && endPoint) {
      const range = calculateRange(startPoint, endPoint);
      onRangeSelect(range);
      setStartPoint(null);
      setEndPoint(null);
    }
  };
  
  return (
    <div 
      className="touch-range-selector"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="range-overlay">
        {startPoint && endPoint && (
          <div 
            className="selection-box"
            style={{
              left: Math.min(startPoint.x, endPoint.x),
              top: Math.min(startPoint.y, endPoint.y),
              width: Math.abs(endPoint.x - startPoint.x),
              height: Math.abs(endPoint.y - startPoint.y)
            }}
          />
        )}
      </div>
    </div>
  );
};
```

### Voice Command Handler

```jsx
const VoiceCommandHandler = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const commands = {
    'select all': () => onCommand('selectAll'),
    'select none': () => onCommand('selectNone'),
    'select range': () => onCommand('selectRange'),
    'bulk edit': () => onCommand('bulkEdit'),
    'undo': () => onCommand('undo'),
    'confirm': () => onCommand('confirm'),
    'cancel': () => onCommand('cancel')
  };
  
  const handleVoiceInput = (transcript) => {
    const command = Object.keys(commands).find(cmd => 
      transcript.toLowerCase().includes(cmd)
    );
    
    if (command) {
      commands[command]();
      // Provide audio feedback
      playAudioFeedback('command_recognized');
    }
  };
  
  return (
    <div className="voice-command-handler">
      <Button
        onClick={() => setIsListening(!isListening)}
        className={`voice-button ${isListening ? 'listening' : ''}`}
      >
        <Mic className="w-6 h-6" />
        {isListening ? 'Listening...' : 'Voice Commands'}
      </Button>
      
      {isListening && (
        <div className="voice-feedback">
          <p>Say: "Select all", "Bulk edit", "Undo", etc.</p>
          <p className="transcript">{transcript}</p>
        </div>
      )}
    </div>
  );
};
```

### Mobile Bulk Wizard

```jsx
const MobileBulkWizard = ({ isOpen, onClose, selectedData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [operation, setOperation] = useState(null);
  
  const steps = [
    { id: 1, title: 'Operation Type', component: MobileOperationSelector },
    { id: 2, title: 'Parameters', component: MobileParameterInput },
    { id: 3, title: 'Preview', component: MobilePreview },
    { id: 4, title: 'Confirm', component: MobileConfirmation }
  ];
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} fullScreen>
      <div className="mobile-wizard bg-gray-900 text-white">
        <div className="wizard-header">
          <div className="step-indicator">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`step ${index < currentStep ? 'completed' : index === currentStep - 1 ? 'current' : 'pending'}`}
              >
                <div className="step-number">{step.id}</div>
                <div className="step-title">{step.title}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="wizard-content">
          {steps[currentStep - 1].component({
            data: selectedData,
            operation,
            onOperationChange: setOperation,
            onNext: () => setCurrentStep(prev => prev + 1),
            onBack: () => setCurrentStep(prev => prev - 1)
          })}
        </div>
        
        <div className="wizard-actions">
          <Button 
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1}
            variant="outline"
          >
            Back
          </Button>
          <Button 
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={currentStep === steps.length}
            className="bg-green-600"
          >
            {currentStep === steps.length ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

## Mobile-Specific Features

### Gesture Recognition

```javascript
const useMobileGestures = () => {
  const [gestures, setGestures] = useState({
    swipeLeft: 0,
    swipeRight: 0,
    longPress: false,
    pinch: null
  });
  
  const bind = useGesture({
    onSwipe: ({ direction, distance }) => {
      if (distance > 50) { // Minimum swipe distance
        setGestures(prev => ({
          ...prev,
          [`swipe${direction[0].toUpperCase() + direction.slice(1)}`]: Date.now()
        }));
      }
    },
    onLongPress: () => {
      setGestures(prev => ({ ...prev, longPress: true }));
    },
    onPinch: ({ offset }) => {
      setGestures(prev => ({ ...prev, pinch: offset }));
    }
  });
  
  return { gestures, bind };
};
```

### Touch Feedback

```javascript
const TouchFeedback = {
  // Haptic feedback for different actions
  select: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  },
  
  confirm: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  },
  
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  },
  
  // Visual feedback
  showToast: (message, type = 'info') => {
    toast(message, {
      position: 'bottom-center',
      duration: 2000,
      className: `mobile-toast ${type}`
    });
  }
};
```

## Integration Points

- Existing `BulkEditModal.js` component
- Current mobile responsive design system
- Existing gesture handling (if any)
- Voice recognition system
- Haptic feedback system

## Definition of Done

- [ ] All acceptance criteria implemented and tested
- [ ] Swipe actions work intuitively on mobile
- [ ] Long press multi-select functions correctly
- [ ] Touch range selection is accurate
- [ ] Voice commands are recognized reliably
- [ ] All bulk operations work on mobile devices
- [ ] Touch interactions are responsive (<100ms)
- [ ] Mobile interface maintains cannabis aesthetic
- [ ] Gesture conflicts are resolved properly
- [ ] Unit tests pass with >90% coverage
- [ ] Mobile-specific integration tests pass
- [ ] Performance: mobile interactions respond in <100ms
- [ ] Accessibility: mobile gestures are accessible
- [ ] Offline capability works on mobile
- [ ] Code review completed and approved

## Notes

- Consider battery optimization for mobile devices
- Ensure gestures don't conflict with native browser gestures
- Provide clear visual feedback for all touch interactions
- Test on various mobile devices and screen sizes
- Consider implementing progressive web app features
- Ensure voice commands work in noisy grow room environments
