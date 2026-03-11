import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useCyclesStore = defineStore('cycles', () => {
  async function fetchActiveCycle(userId) {
    const { data, error } = await supabase
      .from('cycles')
      .select(`
        *,
        items (
          *,
          dishes (*),
          item_tags (
            tags (*)
          )
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'open')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  }

  async function fetchAllActiveCycles() {
    const { data, error } = await supabase
      .from('cycles')
      .select(`
        *,
        users (id, name, role),
        items (
          *,
          dishes (*),
          item_tags (
            tags (*)
          )
        )
      `)
      .eq('status', 'open')
      .order('started_at', { ascending: false })
    if (error) throw error
    return data
  }

  async function fetchArchivedCycles(userId = null) {
    let query = supabase
      .from('cycles')
      .select(`
        *,
        users (id, name, role),
        items (
          *,
          dishes (*),
          item_tags (
            tags (*)
          )
        )
      `)
      .eq('status', 'closed')
      .order('closed_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  async function createCycle(userId) {
    const { data, error } = await supabase
      .from('cycles')
      .insert({ user_id: userId, status: 'open' })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function addItemToCycle(cycleId, userId, itemData) {
    const { data: item, error: itemError } = await supabase
      .from('items')
      .insert({
        cycle_id: cycleId,
        user_id: userId,
        title: itemData.title,
        item_date: itemData.date,
        quantity: itemData.quantity,
        comments: itemData.comments,
      })
      .select()
      .single()
    if (itemError) throw itemError

    if (itemData.dishes && itemData.dishes.length > 0) {
      const dishes = itemData.dishes.map(d => ({
        item_id: item.id,
        name: d.name,
        price: parseFloat(d.price) || 0,
      }))
      const { error: dishesError } = await supabase.from('dishes').insert(dishes)
      if (dishesError) throw dishesError
    }

    if (itemData.tagIds && itemData.tagIds.length > 0) {
      const tags = itemData.tagIds.map(tagId => ({
        item_id: item.id,
        tag_id: tagId,
      }))
      const { error: tagsError } = await supabase.from('item_tags').insert(tags)
      if (tagsError) throw tagsError
    }

    return item
  }

  async function updateItem(itemId, itemData) {
    // Update item fields
    const { error: itemError } = await supabase
      .from('items')
      .update({
        title: itemData.title,
        item_date: itemData.date,
        quantity: itemData.quantity,
        comments: itemData.comments,
      })
      .eq('id', itemId)
    if (itemError) throw itemError

    // Replace dishes: delete all then re-insert
    const { error: delDishesError } = await supabase.from('dishes').delete().eq('item_id', itemId)
    if (delDishesError) throw delDishesError

    if (itemData.dishes && itemData.dishes.length > 0) {
      const dishes = itemData.dishes
        .filter(d => d.name?.trim())
        .map(d => ({
          item_id: itemId,
          name: d.name,
          price: parseFloat(d.price) || 0,
        }))
      if (dishes.length) {
        const { error: dishesError } = await supabase.from('dishes').insert(dishes)
        if (dishesError) throw dishesError
      }
    }

    // Replace tags
    const { error: delTagsError } = await supabase.from('item_tags').delete().eq('item_id', itemId)
    if (delTagsError) throw delTagsError

    if (itemData.tagIds && itemData.tagIds.length > 0) {
      const tags = itemData.tagIds.map(tagId => ({ item_id: itemId, tag_id: tagId }))
      const { error: tagsError } = await supabase.from('item_tags').insert(tags)
      if (tagsError) throw tagsError
    }
  }

  async function deleteItem(itemId) {
    // dishes and item_tags cascade on delete
    const { error } = await supabase.from('items').delete().eq('id', itemId)
    if (error) throw error
  }

  async function closeCycle(cycleId, paidAmount, calculatedTotal) {
    const { data, error } = await supabase
      .from('cycles')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        paid_amount: parseFloat(paidAmount),
        calculated_total: parseFloat(calculatedTotal),
      })
      .eq('id', cycleId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  function calculateCycleTotal(cycle) {
    if (!cycle?.items) return 0
    return cycle.items.reduce((total, item) => {
      const itemTotal = (item.dishes || []).reduce((s, d) => s + (parseFloat(d.price) || 0), 0)
      return total + itemTotal
    }, 0)
  }

  return {
    fetchActiveCycle,
    fetchAllActiveCycles,
    fetchArchivedCycles,
    createCycle,
    addItemToCycle,
    updateItem,
    deleteItem,
    closeCycle,
    calculateCycleTotal,
  }
})
