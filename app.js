class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.todoForm = document.getElementById('todoForm');
        this.todoInput = document.getElementById('todoInput');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompleted = document.getElementById('clearCompleted');
        
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        this.todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        this.clearCompleted.addEventListener('click', () => {
            this.clearCompletedTasks();
        });

        // Enable drag and drop
        this.todoList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('todo-item')) {
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', e.target.dataset.id);
            }
        });

        this.todoList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('todo-item')) {
                e.target.classList.remove('dragging');
            }
        });

        this.todoList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                const afterElement = this.getDragAfterElement(this.todoList, e.clientY);
                if (afterElement) {
                    this.todoList.insertBefore(draggable, afterElement);
                } else {
                    this.todoList.appendChild(draggable);
                }
            }
        });

        this.todoList.addEventListener('drop', (e) => {
            e.preventDefault();
            this.updateTodosOrder();
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    addTodo() {
        const todoText = this.todoInput.value.trim();
        
        if (todoText) {
            const todo = {
                id: Date.now(),
                text: todoText,
                completed: false
            };

            this.todos.unshift(todo);
            this.saveTodos();
            this.render();
            this.todoInput.value = '';
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    clearCompletedTasks() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
        this.render();
    }

    updateTodosOrder() {
        const newOrder = Array.from(this.todoList.children).map(item => {
            return this.todos.find(todo => todo.id === parseInt(item.dataset.id));
        });
        this.todos = newOrder;
        this.saveTodos();
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    render() {
        this.todoList.innerHTML = '';
        
        if (this.todos.length === 0) {
            this.emptyState.style.display = 'block';
            this.taskCount.textContent = '0 tasks';
            return;
        }

        this.emptyState.style.display = 'none';
        this.taskCount.textContent = `${this.todos.length} task${this.todos.length === 1 ? '' : 's'}`;

        this.todos.forEach(todo => {
            const todoElement = document.createElement('div');
            todoElement.className = `todo-item list-group-item d-flex align-items-center ${todo.completed ? 'completed' : ''}`;
            todoElement.draggable = true;
            todoElement.dataset.id = todo.id;

            todoElement.innerHTML = `
                <div class="form-check flex-grow-1">
                    <input class="form-check-input" type="checkbox" ${todo.completed ? 'checked' : ''}>
                    <label class="form-check-label todo-text">${this.escapeHtml(todo.text)}</label>
                </div>
                <div class="todo-actions">
                    <button class="btn btn-sm btn-outline-danger delete-btn">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;

            const checkbox = todoElement.querySelector('.form-check-input');
            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

            const deleteBtn = todoElement.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

            this.todoList.appendChild(todoElement);
        });
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
