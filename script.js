// DOM elements
const dropGrid = document.getElementById('drop-grid');
const inventory = document.getElementById('inventory');
const messageElement = document.getElementById('message');
const resetButton = document.getElementById('reset-button');

// Game Configuration (4x4 Grid)
const GRID_SIZE = 4;
const totalCells = GRID_SIZE * GRID_SIZE;

// --- Puzzle Definition ---
// Define the pieces needed for the puzzle
const requiredPieces = [
    { type: 'T', count: 1 },
    { type: 'L', count: 2 },
    { type: 'I', count: 3 },
];
const totalRequiredPieces = requiredPieces.reduce((sum, item) => sum + item.count, 0);

// Global state tracking
let placedPieces = Array(totalCells).fill(null); // Tracks {type, rotation} on the grid
let draggedPiece = null;
let isSolved = false;

// --- Utility Functions ---

// Converts 1D index to 2D coordinates (row, col)
function indexToCoords(index) {
    return {
        row: Math.floor(index / GRID_SIZE),
        col: index % GRID_SIZE
    };
}

// --- Initialization ---

function initGame() {
    isSolved = false;
    placedPieces = Array(totalCells).fill(null);
    createDropTargets();
    createInventoryPieces();
    messageElement.textContent = 'Drag and drop pipe pieces to connect the path.';
    messageElement.classList.remove('win-message');
}

// 1. Create the 4x4 grid drop targets
function createDropTargets() {
    dropGrid.innerHTML = '';
    for (let i = 0; i < totalCells; i++) {
        const target = document.createElement('div');
        target.classList.add('drop-target');
        target.dataset.index = i;
        
        // Add drop listeners
        target.addEventListener('dragover', e => e.preventDefault());
        target.addEventListener('drop', handleDrop);
        
        // Define Start and End cells
        if (i === 0) { // Top-Left Corner (Start)
             target.textContent = 'START';
             target.classList.add('start-cell');
        } else if (i === totalCells - 1) { // Bottom-Right Corner (End)
             target.textContent = 'END';
             target.classList.add('end-cell');
        } else {
             target.textContent = `Empty ${i}`;
        }
        
        dropGrid.appendChild(target);
    }
}

// 2. Create the draggable pieces in the inventory
function createInventoryPieces() {
    inventory.innerHTML = '<h2>Inventory</h2>';
    
    let pieceIdCounter = 0;
    requiredPieces.forEach(item => {
        for (let i = 0; i < item.count; i++) {
            const piece = document.createElement('div');
            piece.classList.add('pipe-piece', `type-${item.type}`);
            piece.setAttribute('draggable', true);
            piece.dataset.type = item.type;
            piece.dataset.id = `piece-${pieceIdCounter++}`;
            
            // Add drag listeners
            piece.addEventListener('dragstart', handleDragStart);
            piece.addEventListener('dragend', handleDragEnd);
            
            inventory.appendChild(piece);
        }
    });
}

// --- Drag & Drop Handlers ---

function handleDragStart(e) {
    draggedPiece = e.target;
    e.dataTransfer.setData('text/plain', draggedPiece.dataset.id);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDrop(e) {
    e.preventDefault();
    const target = e.currentTarget;

    // Do not drop on occupied cells
    if (target.querySelector('.pipe-piece-placed')) return;
    // Do not drop on Start or End cells
    if (target.classList.contains('start-cell') || target.classList.contains('end-cell')) return;

    // Clone the piece from the inventory
    const pieceClone = draggedPiece.cloneNode(true);
    
    // Modify the clone for placement
    pieceClone.classList.remove('pipe-piece', 'dragging');
    pieceClone.classList.add('pipe-piece-placed', `type-${draggedPiece.dataset.type}`);
    pieceClone.setAttribute('draggable', false);
    pieceClone.textContent = ''; // Clear text
    
    // Add rotation logic (starts at 0 degrees)
    pieceClone.dataset.rotation = 0;
    pieceClone.style.transform = `rotate(0deg)`;
    pieceClone.addEventListener('click', handlePieceRotation);

    // Update the game state array
    const index = parseInt(target.dataset.index);
    placedPieces[index] = { 
        type: draggedPiece.dataset.type, 
        rotation: 0 // Initial rotation
    };

    // Remove the original piece from inventory
    draggedPiece.remove(); 
    draggedPiece = null;
    
    // Update Drop Target appearance
    target.innerHTML = ''; // Clear 'Empty X' text
    target.appendChild(pieceClone);

    // Check for win condition
    if (!isSolved) checkWinCondition();
}

// --- Rotation Logic ---

function handlePieceRotation(e) {
    const piece = e.currentTarget;
    const target = piece.closest('.drop-target');
    const index = parseInt(target.dataset.index);

    // Rotate 90 degrees clockwise
    let currentRotation = parseInt(piece.dataset.rotation);
    let newRotation = (currentRotation + 90) % 360;

    piece.dataset.rotation = newRotation;
    piece.style.transform = `rotate(${newRotation}deg)`;

    // Update game state
    placedPieces[index].rotation = newRotation;

    // Re-check for win condition
    if (!isSolved) checkWinCondition();
}

// --- Win Condition Logic (Simplified Connectivity Check) ---

/* A real connectivity check requires defining connection points for each pipe type
   at each rotation.
   
   Example (connections defined relative to the grid):
   I pipe (0deg): Connects North (N) and South (S)
   I pipe (90deg): Connects East (E) and West (W)
   L pipe (0deg): Connects S and E
   
   The algorithm would traverse the grid starting from (0,0) (Start) and check if
   the path ends at (3,3) (End) without breaks.
*/

function checkWinCondition() {
    // Simplified Win Check: Checks if ALL required pieces are placed.
    let filledCount = 0;
    placedPieces.forEach(p => {
        if (p !== null) filledCount++;
    });

    if (filledCount === totalRequiredPieces) {
        // Placeholder for a real check - this means the player has placed all pieces.
        // Replace this with a detailed path-finding algorithm for a real puzzle!
        
        // For demonstration, let's assume this specific configuration is the win:
        // (This assumes the player must place the pipes in a predetermined winning rotation/order)
        // If (filledCount === totalRequiredPieces) and a hypothetical path-finding function returns true:
        
        if (checkPathConnectivity()) {
             isSolved = true;
             messageElement.textContent = '🎉 Congratulations! Puzzle Solved! 🎉';
             messageElement.classList.add('win-message');
        } else {
             messageElement.textContent = 'All pieces placed, but the path is not connected yet. Try rotating the pieces!';
        }

    } else {
        messageElement.textContent = `Pieces remaining: ${totalRequiredPieces - filledCount}.`;
    }
}

// --- Placeholder for a real Path Connectivity Check ---
// NOTE: This function needs to be fleshed out to be a real puzzle.
function checkPathConnectivity() {
    // This is where you would implement an algorithm (like DFS or BFS)
    // starting at index 0 and trying to reach index 15,
    // only moving to adjacent cells if the pipe pieces connect correctly.
    
    // Since implementing the full connection map is extensive, 
    // we use a simple placeholder.
    
    // For a simple demo: return true if 6 or more pieces are placed (easy win)
    let filledCount = 0;
    placedPieces.forEach(p => { if (p !== null) filledCount++; });

    if (filledCount >= 6) {
        // In a real game, this returns true only if the pipe is connected.
        // For now, it encourages the user to complete the placement.
        return true; 
    }
    return false;
}

// --- Reset Game ---

resetButton.addEventListener('click', () => {
    initGame();
});

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
// Function to create the draggable pieces in the inventory
function createInventoryPieces() {
    inventory.innerHTML = '<h2>Inventory</h2>'; // Clear inventory first
    
    // ... (rest of the logic)
    
    requiredPieces.forEach(item => {
        for (let i = 0; i < item.count; i++) {
            const piece = document.createElement('div');
            piece.classList.add('pipe-piece', `type-${item.type}`); // <--- Ensure type-X class is added
            piece.setAttribute('draggable', true);
            // ... (rest of the logic)
            
            // Add a temporary text label to ensure visibility and drag-ability
            piece.textContent = item.type; 
            
            inventory.appendChild(piece);
        }
    });
}