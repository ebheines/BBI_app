// Generate random numbers for sorting
function generateRandomNumbers(count = 6, min = 1, max = 100) {
    const numbers = [];
    for (let i = 0; i < count; i++) {
        numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return numbers;
}

// Session ID to track student submissions
const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);

// Store steps and initial configuration
let steps = [];
let numbers = generateRandomNumbers();
let startTime = Date.now();

// Create number cards
function createNumberCards() {
    const container = document.getElementById('sortingContainer');
    container.innerHTML = '';
    
    numbers.forEach(number => {
        const card = document.createElement('div');
        card.className = 'number-card';
        card.draggable = true;
        card.textContent = number;
        card.dataset.value = number;
        
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragover', dragOver);
        card.addEventListener('dragenter', dragEnter);
        card.addEventListener('dragleave', dragLeave);
        card.addEventListener('drop', drop);
        card.addEventListener('dragend', dragEnd);
        
        // Add touch support for mobile devices
        card.addEventListener('touchstart', touchStart, {passive: false});
        card.addEventListener('touchmove', touchMove, {passive: false});
        card.addEventListener('touchend', touchEnd, {passive: false});
        
        container.appendChild(card);
    });
    
    // Record initial state
    recordStep('Initial arrangement');
}

// Touch event variables
let touchDraggedElement = null;
let initialX = 0;
let initialY = 0;

// Touch handlers for mobile support
function touchStart(e) {
    e.preventDefault();
    touchDraggedElement = this;
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
    this.classList.add('dragging');
}

function touchMove(e) {
    e.preventDefault();
    if (!touchDraggedElement) return;
    
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    
    // Find if we're over another card
    const targetCard = elements.find(el => el.classList.contains('number-card') && el !== touchDraggedElement);
    
    if (targetCard) {
        targetCard.style.transform = 'scale(1.05)';
    }
    
    // Reset all other cards
    document.querySelectorAll('.number-card').forEach(card => {
        if (card !== targetCard && card !== touchDraggedElement) {
            card.style.transform = '';
        }
    });
}

function touchEnd(e) {
    e.preventDefault();
    if (!touchDraggedElement) return;
    
    const touch = e.changedTouches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    
    // Find if we're over another card
    const targetCard = elements.find(el => el.classList.contains('number-card') && el !== touchDraggedElement);
    
    if (targetCard) {
        // Handle the swap
        handleCardSwap(touchDraggedElement, targetCard);
        targetCard.style.transform = '';
    }
    
    touchDraggedElement.classList.remove('dragging');
    touchDraggedElement = null;
}

// Drag and drop functionality
let draggedElement = null;

function dragStart() {
    this.classList.add('dragging');
    draggedElement = this;
    setTimeout(() => {
        this.style.opacity = '0.6';
    }, 0);
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    this.style.transform = 'scale(1.05)';
}

function dragLeave() {
    this.style.transform = '';
}

function drop() {
    this.style.transform = '';
    
    if (draggedElement !== this) {
        handleCardSwap(draggedElement, this);
    }
}

function dragEnd() {
    this.style.opacity = '1';
    this.classList.remove('dragging');
}

// Handle card swap
function handleCardSwap(draggedCard, targetCard) {
    const allCards = Array.from(document.querySelectorAll('.number-card'));
    const draggedIndex = allCards.indexOf(draggedCard);
    const targetIndex = allCards.indexOf(targetCard);
    
    // Update the DOM
    const container = document.getElementById('sortingContainer');
    if (draggedIndex < targetIndex) {
        container.insertBefore(draggedCard, targetCard.nextSibling);
    } else {
        container.insertBefore(draggedCard, targetCard);
    }
    
    // Record the step
    recordStep(`Swapped ${draggedCard.textContent} and ${targetCard.textContent}`);
    
    // Update the numbers array to match current display
    updateNumbersArray();
}

// Update numbers array based on current display
function updateNumbersArray() {
    const allCards = document.querySelectorAll('.number-card');
    numbers = Array.from(allCards).map(card => parseInt(card.textContent, 10));
}

// Record steps (without showing to student)
function recordStep(action) {
    const currentState = [...numbers];
    steps.push({
        action: action,
        state: currentState,
        timestamp: Date.now() - startTime
    });
}

// Check if the array is sorted
function isSorted() {
    for (let i = 0; i < numbers.length - 1; i++) {
        if (numbers[i] > numbers[i + 1]) {
            return false;
        }
    }
    return true;
}

// Submit solution
document.getElementById('submitBtn').addEventListener('click', function() {
    const explanation = document.getElementById('explanation').value.trim();
    if (!explanation) {
        alert('Please explain your approach before submitting.');
        return;
    }
    
    const sorted = isSorted();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Prepare submission data
    const submissionData = {
        sessionId: sessionId,
        startingArray: steps[0].state,
        finalArray: numbers,
        steps: steps,
        explanation: explanation,
        duration: duration,
        correctlySorted: sorted,
        timestamp: new Date().toISOString()
    };
    
    // Send data to server
    fetch('/api/submissions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('feedback').style.display = 'flex';
            document.getElementById('submitBtn').disabled = true;
            
            // Close feedback after 3 seconds
            setTimeout(() => {
                document.getElementById('feedback').style.display = 'none';
                // Optional: Reload for a new attempt
                // window.location.reload();
            }, 3000);
        } else {
            alert('Error submitting your solution. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting your solution. Please try again.');
    });
});

// Initialize
window.addEventListener('load', createNumberCards);