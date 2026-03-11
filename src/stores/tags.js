import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useTagsStore = defineStore('tags', () => {
  async function fetchTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name')
    if (error) throw error
    return data
  }

  async function createTag(name) {
    const { data, error } = await supabase
      .from('tags')
      .insert({ name })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function deleteTag(id) {
    const { error } = await supabase.from('tags').delete().eq('id', id)
    if (error) throw error
  }

  return { fetchTags, createTag, deleteTag }
})
