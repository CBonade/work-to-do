// Mock service for localhost development
// This simulates database operations using localStorage

const MOCK_USER_ID = 'mock-user-id-123';

// Helper to get data from localStorage with a prefix
const getLocalData = (key) => {
  const data = localStorage.getItem(`mock_${key}`);
  return data ? JSON.parse(data) : [];
};

const setLocalData = (key, data) => {
  localStorage.setItem(`mock_${key}`, JSON.stringify(data));
};

// Generate mock IDs
const generateId = () => `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Mock Todo Service
export const mockTodoService = {
  async getTodos(userId, context) {
    console.log('🔧 Mock: Getting todos for', context);
    const todos = getLocalData(`todos_${context}`);
    return todos.filter(todo => !todo.completed && !todo.wont_do);
  },

  async getCompletedTodos(userId, context) {
    console.log('🔧 Mock: Getting completed todos for', context);
    const todos = getLocalData(`todos_${context}`);
    return todos.filter(todo => todo.completed);
  },

  async getWontDoTodos(userId, context) {
    console.log('🔧 Mock: Getting won\'t do todos for', context);
    const todos = getLocalData(`todos_${context}`);
    return todos.filter(todo => todo.wont_do);
  },

  async createTodo(userId, context, todoData) {
    console.log('🔧 Mock: Creating todo', todoData);
    const todos = getLocalData(`todos_${context}`);
    const newTodo = {
      id: generateId(),
      user_id: userId,
      context,
      text: todoData.text,
      tags: todoData.tags || [],
      completed: false,
      wont_do: false,
      deadline: todoData.deadline,
      sort_order: todos.length,
      created_at: new Date().toISOString()
    };
    todos.push(newTodo);
    setLocalData(`todos_${context}`, todos);
    return newTodo;
  },

  async updateTodo(todoId, updates) {
    console.log('🔧 Mock: Updating todo', todoId, updates);
    // Find todo across all contexts
    for (const context of ['work', 'personal']) {
      const todos = getLocalData(`todos_${context}`);
      const index = todos.findIndex(t => t.id === todoId);
      if (index !== -1) {
        todos[index] = { ...todos[index], ...updates };
        setLocalData(`todos_${context}`, todos);
        return todos[index];
      }
    }
    throw new Error('Todo not found');
  },

  async markTodoCompleted(todoId) {
    return this.updateTodo(todoId, {
      completed: true,
      completed_date: new Date().toISOString()
    });
  },

  async markTodoUncompleted(todoId) {
    return this.updateTodo(todoId, {
      completed: false,
      completed_date: null
    });
  },

  async markTodoWontDo(todoId) {
    return this.updateTodo(todoId, {
      wont_do: true,
      wont_do_date: new Date().toISOString(),
      completed: false,
      completed_date: null
    });
  },

  async markTodoWillDo(todoId) {
    return this.updateTodo(todoId, {
      wont_do: false,
      wont_do_date: null
    });
  },

  async deleteTodo(todoId) {
    console.log('🔧 Mock: Deleting todo', todoId);
    for (const context of ['work', 'personal']) {
      const todos = getLocalData(`todos_${context}`);
      const filtered = todos.filter(t => t.id !== todoId);
      if (filtered.length !== todos.length) {
        setLocalData(`todos_${context}`, filtered);
        return;
      }
    }
  },

  async updateTodoOrder(todos) {
    console.log('🔧 Mock: Updating todo order');
    // This is a simplified implementation
    return Promise.resolve();
  }
};

// Mock Tag Service
export const mockTagService = {
  async getTags(userId, context) {
    console.log('🔧 Mock: Getting tags for', context);
    return getLocalData(`tags_${context}`);
  },

  async createTag(userId, context, tagData) {
    console.log('🔧 Mock: Creating tag', tagData);
    const tags = getLocalData(`tags_${context}`);
    const newTag = {
      id: generateId(),
      user_id: userId,
      context,
      name: tagData.name,
      color: tagData.color,
      created_at: new Date().toISOString()
    };
    tags.push(newTag);
    setLocalData(`tags_${context}`, tags);
    return newTag;
  },

  async deleteTag(tagId) {
    console.log('🔧 Mock: Deleting tag', tagId);
    for (const context of ['work', 'personal']) {
      const tags = getLocalData(`tags_${context}`);
      const filtered = tags.filter(t => t.id !== tagId);
      if (filtered.length !== tags.length) {
        setLocalData(`tags_${context}`, filtered);
        return;
      }
    }
  }
};

// Mock Weekly Task Service
export const mockWeeklyTaskService = {
  async getWeeklyTasks(userId, context) {
    console.log('🔧 Mock: Getting weekly tasks for', context);
    return getLocalData(`weeklyTasks_${context}`);
  },

  async createWeeklyTask(userId, context, taskData) {
    console.log('🔧 Mock: Creating weekly task', taskData);
    const tasks = getLocalData(`weeklyTasks_${context}`);
    const newTask = {
      id: generateId(),
      user_id: userId,
      context,
      text: taskData.text,
      day_of_week: taskData.dayOfWeek,
      completed_this_week: false,
      last_completed_date: null,
      created_at: new Date().toISOString()
    };
    tasks.push(newTask);
    setLocalData(`weeklyTasks_${context}`, tasks);
    return newTask;
  },

  async markWeeklyTaskCompleted(taskId) {
    console.log('🔧 Mock: Marking weekly task completed', taskId);
    for (const context of ['work', 'personal']) {
      const tasks = getLocalData(`weeklyTasks_${context}`);
      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks[index] = {
          ...tasks[index],
          completed_this_week: true,
          last_completed_date: new Date().toISOString()
        };
        setLocalData(`weeklyTasks_${context}`, tasks);
        return tasks[index];
      }
    }
  },

  async markWeeklyTaskIncomplete(taskId) {
    console.log('🔧 Mock: Marking weekly task incomplete', taskId);
    for (const context of ['work', 'personal']) {
      const tasks = getLocalData(`weeklyTasks_${context}`);
      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks[index] = {
          ...tasks[index],
          completed_this_week: false
        };
        setLocalData(`weeklyTasks_${context}`, tasks);
        return tasks[index];
      }
    }
  },

  async deleteWeeklyTask(taskId) {
    console.log('🔧 Mock: Deleting weekly task', taskId);
    for (const context of ['work', 'personal']) {
      const tasks = getLocalData(`weeklyTasks_${context}`);
      const filtered = tasks.filter(t => t.id !== taskId);
      if (filtered.length !== tasks.length) {
        setLocalData(`weeklyTasks_${context}`, filtered);
        return;
      }
    }
  },

  async resetWeeklyTasks(userId, context) {
    console.log('🔧 Mock: Resetting weekly tasks for', context);
    const tasks = getLocalData(`weeklyTasks_${context}`);
    tasks.forEach(task => task.completed_this_week = false);
    setLocalData(`weeklyTasks_${context}`, tasks);
  },

  async updateWeeklyTask(taskId, updates) {
    console.log('🔧 Mock: Updating weekly task', taskId, updates);
    for (const context of ['work', 'personal']) {
      const tasks = getLocalData(`weeklyTasks_${context}`);
      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updates };
        setLocalData(`weeklyTasks_${context}`, tasks);
        return tasks[index];
      }
    }
  }
};

// Mock Agenda Service
export const mockAgendaService = {
  async getAgendas(userId, context) {
    console.log('🔧 Mock: Getting agendas for', context);
    const agendas = getLocalData(`agendas_${context}`);
    // Also get agenda items for each agenda
    return agendas.map(agenda => ({
      ...agenda,
      agenda_items: getLocalData(`agendaItems_${agenda.id}`) || []
    }));
  },

  async createAgenda(userId, context, agendaData) {
    try {
      console.log('🔧 Mock: Creating agenda', agendaData);
      if (!agendaData || !agendaData.title) {
        throw new Error('Agenda data is missing or invalid');
      }

      const agendas = getLocalData(`agendas_${context}`);
      const newAgenda = {
        id: generateId(),
        user_id: userId,
        context,
        title: agendaData.title,
        is_collapsed: agendaData.is_collapsed !== undefined ? agendaData.is_collapsed : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      agendas.push(newAgenda);
      setLocalData(`agendas_${context}`, agendas);
      console.log('🔧 Mock: Successfully created agenda', newAgenda);
      return { ...newAgenda, agenda_items: [] };
    } catch (error) {
      console.error('🔧 Mock: Error creating agenda:', error);
      throw error;
    }
  },

  async updateAgenda(agendaId, updates) {
    console.log('🔧 Mock: Updating agenda', agendaId, updates);
    for (const context of ['work', 'personal']) {
      const agendas = getLocalData(`agendas_${context}`);
      const index = agendas.findIndex(a => a.id === agendaId);
      if (index !== -1) {
        agendas[index] = {
          ...agendas[index],
          ...updates,
          updated_at: new Date().toISOString()
        };
        setLocalData(`agendas_${context}`, agendas);
        return agendas[index];
      }
    }
  },

  async deleteAgenda(agendaId) {
    console.log('🔧 Mock: Deleting agenda', agendaId);
    for (const context of ['work', 'personal']) {
      const agendas = getLocalData(`agendas_${context}`);
      const filtered = agendas.filter(a => a.id !== agendaId);
      if (filtered.length !== agendas.length) {
        setLocalData(`agendas_${context}`, filtered);
        // Also delete agenda items
        localStorage.removeItem(`mock_agendaItems_${agendaId}`);
        return;
      }
    }
  },

  async addAgendaItem(agendaId, itemText) {
    try {
      console.log('🔧 Mock: Adding agenda item', agendaId, itemText);
      if (!agendaId || !itemText) {
        throw new Error('Agenda ID or item text is missing');
      }

      const items = getLocalData(`agendaItems_${agendaId}`);
      const newItem = {
        id: generateId(),
        agenda_id: agendaId,
        text: itemText,
        sort_order: items.length,
        created_at: new Date().toISOString()
      };
      items.push(newItem);
      setLocalData(`agendaItems_${agendaId}`, items);
      console.log('🔧 Mock: Successfully added agenda item', newItem);
      return newItem;
    } catch (error) {
      console.error('🔧 Mock: Error adding agenda item:', error);
      throw error;
    }
  },

  async updateAgendaItem(itemId, updates) {
    console.log('🔧 Mock: Updating agenda item', itemId, updates);
    // Find item across all agendas
    const agendaKeys = Object.keys(localStorage).filter(key => key.startsWith('mock_agendaItems_'));
    for (const key of agendaKeys) {
      const items = JSON.parse(localStorage.getItem(key));
      const index = items.findIndex(item => item.id === itemId);
      if (index !== -1) {
        items[index] = { ...items[index], ...updates };
        localStorage.setItem(key, JSON.stringify(items));
        return items[index];
      }
    }
  },

  async deleteAgendaItem(itemId) {
    console.log('🔧 Mock: Deleting agenda item', itemId);
    const agendaKeys = Object.keys(localStorage).filter(key => key.startsWith('mock_agendaItems_'));
    for (const key of agendaKeys) {
      const items = JSON.parse(localStorage.getItem(key));
      const filtered = items.filter(item => item.id !== itemId);
      if (filtered.length !== items.length) {
        localStorage.setItem(key, JSON.stringify(filtered));
        return;
      }
    }
  },

  async reorderAgendaItems(items) {
    console.log('🔧 Mock: Reordering agenda items');
    // Simplified implementation
    return Promise.resolve();
  }
};

// Initialize with some sample data for development
export const initializeMockData = () => {
  console.log('🔧 Initializing mock data for development');

  // Sample todos
  if (getLocalData('todos_work').length === 0) {
    setLocalData('todos_work', [
      {
        id: 'sample-todo-1',
        text: 'Test the new agendas feature',
        tags: [],
        completed: false,
        wont_do: false,
        deadline: null,
        sort_order: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 'sample-todo-2',
        text: 'Review code changes',
        tags: [],
        completed: true,
        wont_do: false,
        deadline: null,
        sort_order: 1,
        completed_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ]);
  }

  // Sample tags
  if (getLocalData('tags_work').length === 0) {
    setLocalData('tags_work', [
      {
        id: 'sample-tag-1',
        name: 'Development',
        color: '#14b8a6',
        created_at: new Date().toISOString()
      },
      {
        id: 'sample-tag-2',
        name: 'Testing',
        color: '#f59e0b',
        created_at: new Date().toISOString()
      }
    ]);
  }

  // Sample agenda
  if (getLocalData('agendas_work').length === 0) {
    const sampleAgendaId = 'sample-agenda-1';
    setLocalData('agendas_work', [
      {
        id: sampleAgendaId,
        title: 'Weekly Team Meeting',
        is_collapsed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);

    setLocalData(`agendaItems_${sampleAgendaId}`, [
      {
        id: 'sample-item-1',
        agenda_id: sampleAgendaId,
        text: 'Discuss new feature requirements',
        sort_order: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 'sample-item-2',
        agenda_id: sampleAgendaId,
        text: 'Review last week\'s progress',
        sort_order: 1,
        created_at: new Date().toISOString()
      }
    ]);
  }
};