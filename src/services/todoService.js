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
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching todos:', error);
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
    const { data, error } = await supabase
      .from('todos')
      .insert([{
        user_id: userId,
        context: context,
        text: todoData.text,
        tags: todoData.tags || [],
        completed: false
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
      completed_date: todo.completedDate || null
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