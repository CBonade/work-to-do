import { supabase } from '../lib/supabase';

// Todo operations
export const todoService = {
  // Get all todos for a user and context
  async getTodos(userId, context) {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('context', context)
      .eq('completed', false)
      .eq('wont_do', false)
      .order('sort_order', { ascending: true, nullsLast: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
    return data || [];
  },

  // Get won't do todos for a user and context
  async getWontDoTodos(userId, context) {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('context', context)
      .eq('wont_do', true)
      .order('wont_do_date', { ascending: false });

    if (error) {
      console.error('Error fetching won\'t do todos:', error);
      throw error;
    }
    return data || [];
  },

  // Get completed todos for a user and context
  async getCompletedTodos(userId, context) {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('context', context)
      .eq('completed', true)
      .order('completed_date', { ascending: false });

    if (error) {
      console.error('Error fetching completed todos:', error);
      throw error;
    }
    return data || [];
  },

  // Create a new todo
  async createTodo(userId, context, todoData) {
    // Get the current max sort_order for this user/context
    const { data: maxOrderData } = await supabase
      .from('todos')
      .select('sort_order')
      .eq('user_id', userId)
      .eq('context', context)
      .eq('completed', false)
      .order('sort_order', { ascending: false, nullsLast: false })
      .limit(1);

    const nextSortOrder = maxOrderData?.[0]?.sort_order != null
      ? maxOrderData[0].sort_order + 1
      : 0;

    const { data, error } = await supabase
      .from('todos')
      .insert([{
        user_id: userId,
        context: context,
        text: todoData.text,
        tags: todoData.tags || [],
        completed: false,
        sort_order: nextSortOrder,
        deadline: todoData.deadline || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
    return data;
  },

  // Update a todo
  async updateTodo(todoId, updates) {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', todoId)
      .select()
      .single();

    if (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
    return data;
  },

  // Mark todo as completed
  async markTodoCompleted(todoId) {
    return this.updateTodo(todoId, {
      completed: true,
      completed_date: new Date().toISOString()
    });
  },

  // Mark todo as not completed
  async markTodoUncompleted(todoId) {
    return this.updateTodo(todoId, {
      completed: false,
      completed_date: null
    });
  },

  // Mark todo as won't do
  async markTodoWontDo(todoId) {
    return this.updateTodo(todoId, {
      wont_do: true,
      wont_do_date: new Date().toISOString(),
      completed: false,
      completed_date: null
    });
  },

  // Unmark todo as won't do (back to active)
  async markTodoWillDo(todoId) {
    return this.updateTodo(todoId, {
      wont_do: false,
      wont_do_date: null
    });
  },

  // Delete a todo
  async deleteTodo(todoId) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todoId);

    if (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },

  // Bulk create todos (for migration)
  async bulkCreateTodos(userId, context, todos) {
    const todosToInsert = todos.map(todo => ({
      user_id: userId,
      context: context,
      text: todo.text,
      tags: todo.tags || [],
      completed: todo.completed || false,
      completed_date: todo.completed_date || null,
      deadline: todo.deadline || null
    }));

    const { data, error } = await supabase
      .from('todos')
      .insert(todosToInsert)
      .select();

    if (error) {
      console.error('Error bulk creating todos:', error);
      throw error;
    }
    return data;
  },

  // Update sort order for multiple todos
  async updateTodoOrder(todos) {
    // Update each todo's sort_order individually to respect RLS policies
    const updatePromises = todos.map((todo, index) =>
      supabase
        .from('todos')
        .update({ sort_order: index })
        .eq('id', todo.id)
    );

    const results = await Promise.all(updatePromises);

    // Check for any errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Error updating todo order:', errors[0].error);
      throw errors[0].error;
    }
  }
};

// Tag operations
export const tagService = {
  // Get all tags for a user and context
  async getTags(userId, context) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .eq('context', context)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
    return data || [];
  },

  // Create a new tag
  async createTag(userId, context, tagData) {
    const { data, error } = await supabase
      .from('tags')
      .insert([{
        user_id: userId,
        context: context,
        name: tagData.name,
        color: tagData.color
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
    return data;
  },

  // Delete a tag
  async deleteTag(tagId) {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId);

    if (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  },

  // Bulk create tags (for migration)
  async bulkCreateTags(userId, context, tags) {
    const tagsToInsert = tags.map(tag => ({
      user_id: userId,
      context: context,
      name: tag.name,
      color: tag.color
    }));

    const { data, error } = await supabase
      .from('tags')
      .insert(tagsToInsert)
      .select();

    if (error) {
      console.error('Error bulk creating tags:', error);
      throw error;
    }
    return data;
  }
};

// Weekly Task operations
export const weeklyTaskService = {
  // Get all weekly tasks for a user and context
  async getWeeklyTasks(userId, context) {
    const { data, error } = await supabase
      .from('weekly_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('context', context)
      .order('day_of_week', { ascending: true });

    if (error) {
      console.error('Error fetching weekly tasks:', error);
      throw error;
    }
    return data || [];
  },

  // Create a new weekly task
  async createWeeklyTask(userId, context, taskData) {
    const { data, error } = await supabase
      .from('weekly_tasks')
      .insert([{
        user_id: userId,
        context: context,
        text: taskData.text,
        day_of_week: taskData.dayOfWeek, // 0 = Sunday, 1 = Monday, etc.
        completed_this_week: false,
        last_completed_date: null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating weekly task:', error);
      throw error;
    }
    return data;
  },

  // Mark weekly task as completed for this week
  async markWeeklyTaskCompleted(taskId) {
    const { data, error } = await supabase
      .from('weekly_tasks')
      .update({
        completed_this_week: true,
        last_completed_date: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error marking weekly task completed:', error);
      throw error;
    }
    return data;
  },

  // Mark weekly task as incomplete
  async markWeeklyTaskIncomplete(taskId) {
    const { data, error } = await supabase
      .from('weekly_tasks')
      .update({
        completed_this_week: false
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error marking weekly task incomplete:', error);
      throw error;
    }
    return data;
  },

  // Reset all weekly tasks for a new week
  async resetWeeklyTasks(userId, context) {
    const { error } = await supabase
      .from('weekly_tasks')
      .update({
        completed_this_week: false
      })
      .eq('user_id', userId)
      .eq('context', context);

    if (error) {
      console.error('Error resetting weekly tasks:', error);
      throw error;
    }
  },

  // Delete a weekly task
  async deleteWeeklyTask(taskId) {
    const { error } = await supabase
      .from('weekly_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting weekly task:', error);
      throw error;
    }
  },

  // Update a weekly task
  async updateWeeklyTask(taskId, updates) {
    const { data, error } = await supabase
      .from('weekly_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating weekly task:', error);
      throw error;
    }
    return data;
  }
};