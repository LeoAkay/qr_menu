'use client'

import { useState, useEffect, useRef } from 'react' 
import { useRouter, useSearchParams } from 'next/navigation'

export default function EditCompanyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [cId, setCId] = useState('')
  const [userId, setuserId] = useState('')
  const [showThemeOptions, setShowThemeOptions] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Auto-fill Company ID from query
  useEffect(() => {
    const companyId = searchParams.get('cId')
    const userName = searchParams.get('username')
    const pass = searchParams.get('password')
    if (companyId) {
      setCId(companyId)
    }
    if (userName) {
      setUsername(userName)
    }
    if (pass) {
      setPassword(pass)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/AdminPanel/company/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          C_id: parseInt(cId),
          Username: username,
          Password: password,
          updatedBy: localStorage.getItem('adminId'),
          NewPass: newPassword,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update company')
      }

      alert('Company Updated!')
      
      router.push('/admin_login/view_companies')
    } catch (err: any) {
      alert(`Error updating company: ${err.message || 'Unknown error'}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const [categories, setCategories] = useState<any[]>([])
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState<string | null>(null)
  const [showEditCategoryForm, setShowEditCategoryForm] = useState(false)
  const [showEditItemForm, setShowEditItemForm] = useState(false)

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    backgroundImage: null as File | null
  })

  const [itemForm, setItemForm] = useState({
    name: '',
    price: '',
    menuImage: null as File | null
  })

  const [editCategoryForm, setEditCategoryForm] = useState({
    name: '',
    backgroundImage: null as File | null
  })

  const [editItemForm, setEditItemForm] = useState({
    name: '',
    price: '',
    menuImage: null as File | null
  })

  useEffect(() => {
  if (cId) {
    fetchUserIdFromCId(parseInt(cId))
  }
}, [cId])

const fetchUserIdFromCId = async (cId: number) => {
  try {
    const res = await fetch('/api/AdminPanel/company/getuserid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cId }),
    })
    const data = await res.json()
    if (data.userId) {
      setuserId(data.userId)
    } else {
      console.error('User ID not found for cId:', cId)
    }
  } catch (err) {
    console.error('Failed to fetch userId:', err)
  }
}


 useEffect(() => {
  if (userId) {
    fetchCategories()
  }
}, [userId])


  const fetchCategories = async () => {
  try {
    const res = await fetch('/api/AdminPanel/company/show', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: userId  })
    })

    if (res.ok) {
      const data = await res.json()
      setCategories(data.categories || [])
    } else {
      console.error('Server error:', await res.json())
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  } finally {
    setLoading(false)
  }
}


  const handleAddCategory = async () => {
    try {
      const formData = new FormData()
      formData.append('name', categoryForm.name)
      if (categoryForm.backgroundImage) {
        formData.append('backgroundImage', categoryForm.backgroundImage)
      }
      const userId = localStorage.getItem('userId');

      const res = await fetch('/api/AdminPanel/company/show/category', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (res.ok) {
        alert('Category added successfully!')
        setCategoryForm({ name: '', backgroundImage: null })
        setShowCategoryForm(false)
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add category')
      }
    } catch (error) {
      console.error('Add category error:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleAddItem = async (categoryId: string) => {
    try {
      const formData = new FormData()
      formData.append('name', itemForm.name)
      if (itemForm.price) {
        formData.append('price', itemForm.price)
      }
      formData.append('mainCategoryId', categoryId)
      if (itemForm.menuImage) {
        formData.append('menuImage', itemForm.menuImage)
      }
      const userId = localStorage.getItem('userId');

      const res = await fetch('/api/AdminPanel/company/show/item', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (res.ok) {
        alert('Item added successfully!')
        setItemForm({
          name: '', price: '', menuImage: null
        })
        setShowItemForm(null)
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add item')
      }
    } catch (error) {
      console.error('Add item error:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
  if (!confirm(`Are you sure you want to delete "${categoryName}" category? This will also delete all items in this category.`)) {
    return
  }

  try {
    const cId = searchParams.get('cId')

    const res = await fetch(`/api/AdminPanel/company/show/category?categoryId=${categoryId}&cId=${cId}`, {
      method: 'DELETE'
    })

    if (res.ok) {
      alert('Category deleted successfully!')
      fetchCategories()
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to delete category')
    }
  } catch (error) {
    console.error('Delete category error:', error)
    alert('Network error. Please try again.')
  }
}


  const handleDeleteItem = async (itemId: string, itemName: string) => {
  if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return

  try {
    const res = await fetch(`/api/AdminPanel/company/show/item?itemId=${itemId}&userId=${userId}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (res.ok) {
      alert('Item deleted successfully!')
      fetchCategories()
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to delete item')
    }
  } catch (error) {
    console.error('Delete item error:', error)
    alert('Network error. Please try again.')
  }
}

  const handleEditCategory = (category: any) => {
    setEditingCategory(category)
    setEditCategoryForm({
      name: category.name,
      backgroundImage: null
    })
    setShowEditCategoryForm(true)
  }

  const handleEditItem = (item: any) => {
    setEditingItem(item)
    setEditItemForm({
      name: item.name,
      price: item.price?.toString() || '',
      menuImage: null
    })
    setShowEditItemForm(true)
  }

  const handleUpdateCategory = async () => {
  if (!editingCategory) return

  try {
    const cId = searchParams.get('cId') // 👈 get it from query param
    const formData = new FormData()
    formData.append('name', editCategoryForm.name)
    if (editCategoryForm.backgroundImage) {
      formData.append('backgroundImage', editCategoryForm.backgroundImage)
    }

    const res = await fetch(
      `/api/AdminPanel/company/show/category?categoryId=${editingCategory.id}&cId=${cId}`,
      {
        method: 'PUT',
        body: formData,
      }
    )

    if (res.ok) {
      alert('Category updated successfully!')
      setEditCategoryForm({ name: '', backgroundImage: null })
      setShowEditCategoryForm(false)
      setEditingCategory(null)
      fetchCategories()
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to update category')
    }
  } catch (error) {
    console.error('Update category error:', error)
    alert('Network error. Please try again.')
  }
}


  const handleUpdateItem = async () => {
  if (!editingItem) return

  try {
    const formData = new FormData()
    formData.append('name', editItemForm.name)
    if (editItemForm.price) {
      formData.append('price', editItemForm.price)
    }
    if (editItemForm.menuImage) {
      formData.append('menuImage', editItemForm.menuImage)
    }
    const userId = localStorage.getItem('userId');
    const res = await fetch(`/api/AdminPanel/company/show/item?itemId=${editingItem.id}&userId=${userId}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include'
    })

    if (res.ok) {
      alert('Item updated successfully!')
      setEditItemForm({ name: '', price: '', menuImage: null })
      setShowEditItemForm(false)
      setEditingItem(null)
      fetchCategories()
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to update item')
    }
  } catch (error) {
    console.error('Update item error:', error)
    alert('Network error. Please try again.')
  }
}


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

return (
  <div className="w-full px-4 py-10">
    <div className="flex flex-col items-center space-y-12 max-w-5xl mx-auto">
      <div className="w-full max-w-2xl bg-gray bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl p-12 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-lg font-medium">Company ID (C_id)</label>
          <input
            type="number"
            value={cId}
            placeholder="Enter Company ID"
            onChange={(e) => setCId(e.target.value)}
            required
            className="w-full p-3 border rounded text-lg"
          />
        </div>

        <div>
          <label className="block mb-2 text-lg font-medium">Username</label>
          <input
            type="text"
            value={username}
            placeholder="Enter Username"
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 border rounded text-lg"
          />
        </div>

        <div>
          <label className="block mb-2 text-lg font-medium">Old Password</label>
          <input
            type="text"
            value={password}
            placeholder="Enter Old Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border rounded text-lg"
          />
        </div>
        <div>
          <label className="block mb-2 text-lg font-medium">New Password</label>
          <input
            type="text"
            value={newPassword}
            placeholder="Enter New Password"
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-3 border rounded text-lg"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition duration-300 text-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Company'}
        </button>
      </form>
      </div>
    </div>
    {/* Menu Builder Section (moved here below the form) */}
      <div className="flex items-center justify-between mt-6 bg-gray bg-opacity-90 py-6 backdrop-blur-md rounded-2xl shadow-2xl">
          <h3 className="text-2xl font-semibold text-gray-800">Order System Builder</h3>
          <button
            onClick={() => setShowThemeOptions(!showThemeOptions)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            {showThemeOptions ? '⬆️ Hide' : '🎨 Customize'}
          </button>
        </div>
{showThemeOptions && (
    <div className="w-full  bg-gray bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl">
      <div className="w-full max-w-screen-xl mx-auto bg-gray bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl ">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowCategoryForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-54 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Category
        </button>
      </div>

      {/* Add Category Form */}
      {showCategoryForm && (
        <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category Name</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="e.g., Appetizers, Main Courses"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Background Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCategoryForm({...categoryForm, backgroundImage: e.target.files?.[0] || null})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleAddCategory}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Save Category
            </button>
            <button
              onClick={() => setShowCategoryForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
              )}

        {/* Edit Category Modal */}
        {showEditCategoryForm && (
          <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Edit Category: {editingCategory?.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name</label>
                <input
                  type="text"
                  value={editCategoryForm.name}
                  onChange={(e) => setEditCategoryForm({...editCategoryForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  placeholder="e.g., Appetizers, Main Courses"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Background Image (Optional - Leave empty to keep current)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditCategoryForm({...editCategoryForm, backgroundImage: e.target.files?.[0] || null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleUpdateCategory}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Update Category
              </button>
              <button
                onClick={() => {
                  setShowEditCategoryForm(false)
                  setEditingCategory(null)
                  setEditCategoryForm({ name: '', backgroundImage: null })
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {showEditItemForm && (
          <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Edit Item: {editingItem?.name}</h3>
                         <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium mb-2">Item Name</label>
                 <input
                   type="text"
                   value={editItemForm.name}
                   onChange={(e) => setEditItemForm({...editItemForm, name: e.target.value})}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                   placeholder="e.g., Grilled Chicken"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-2">Price (₺)</label>
                 <input
                   type="number"
                   step="0.01"
                   value={editItemForm.price}
                   onChange={(e) => setEditItemForm({...editItemForm, price: e.target.value})}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                   placeholder="e.g., 19.99"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-2">Item Image (Optional - Leave empty to keep current)</label>
                 <input
                   type="file"
                   accept="image/*"
                   onChange={(e) => setEditItemForm({...editItemForm, menuImage: e.target.files?.[0] || null})}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                 />
               </div>
             </div>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleUpdateItem}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Update Item
              </button>
              <button
                onClick={() => {
                  setShowEditItemForm(false)
                  setEditingItem(null)
                  setEditItemForm({ name: '', price: '', menuImage: null })
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-medium mb-2">No Categories Yet</h3>
          <p className="text-sm">Start by adding your first menu category</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
                         <div key={category.id} className="border border-gray-200 rounded-xl p-6 bg-white">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-semibold text-gray-800">{category.name}</h3>
                 <div className="flex space-x-2">
                   <button
                     onClick={() => setShowItemForm(showItemForm === category.id ? null : category.id)}
                     className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                   >
                     + Add Item
                   </button>
                   <button
                     onClick={() => handleEditCategory(category)}
                     className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                   >
                     ✏️ Edit
                   </button>
                   <button
                     onClick={() => handleDeleteCategory(category.id, category.name)}
                     className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                   >
                     🗑️ Delete
                   </button>
                 </div>
               </div>

              {/* Add Item Form */}
              {showItemForm === category.id && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-lg font-medium mb-3">Add New Item to {category.name}</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Item Name</label>
                      <input
                        type="text"
                        value={itemForm.name}
                        onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="e.g., Grilled Chicken"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price (₺)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={itemForm.price}
                        onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="e.g., 19.99"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Item Image (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setItemForm({...itemForm, menuImage: e.target.files?.[0] || null})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => handleAddItem(category.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Save Item
                    </button>
                    <button
                      onClick={() => setShowItemForm(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
             {/* Items List */}
              <div className="space-y-3">
                                 {category.subCategories?.map((item: any) => (
                   <div key={item.id} ref={el => { itemRefs.current[item.id] = el; }} className={`border border-gray-100 rounded-lg p-4 bg-gray-50 ${highlightedItemId === item.id ? 'ring-4 ring-purple-400' : ''}`}>
                     <div className="flex justify-between items-start">
                       <div className="flex-1">
                         <div className="flex items-center space-x-3">
                           <h4 className="font-semibold text-gray-800">{item.name}</h4>
                           {item.price && (
                             <span className="text-green-600 font-bold">₺{item.price}</span>
                           )}
                         </div>
                       </div>
                       <div className="flex items-center space-x-3">
                         {item.menuImageUrl && (
                           <div>
                             <img 
                               src={`/api/QR_Panel/user/manual-menu/image/${item.id}`}
                               alt={item.name}
                               className="w-16 h-16 object-cover rounded-lg"
                             />
                           </div>
                         )}
                         <button
                           onClick={() => handleEditItem(item)}
                           className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md font-medium transition-colors text-sm"
                         >
                           ✏️
                         </button>
                         <button
                           onClick={() => handleDeleteItem(item.id, item.name)}
                           className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md font-medium transition-colors text-sm"
                         >
                           🗑️
                         </button>
                       </div>
                     </div>
                     {/* Inline Edit Item Form */}
                     {editingItem?.id === item.id && (
                       <div className="mt-4 mb-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                         <h3 className="text-lg font-semibold mb-4">Edit Item: {editingItem?.name}</h3>
                         <div className="space-y-4">
                           <div>
                             <label className="block text-sm font-medium mb-2">Item Name</label>
                             <input
                               type="text"
                               value={editItemForm.name}
                               onChange={(e) => setEditItemForm({...editItemForm, name: e.target.value})}
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                               placeholder="e.g., Grilled Chicken"
                             />
                           </div>
                           <div>
                             <label className="block text-sm font-medium mb-2">Price (₺)</label>
                             <input
                               type="number"
                               step="0.01"
                               value={editItemForm.price}
                               onChange={(e) => setEditItemForm({...editItemForm, price: e.target.value})}
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                               placeholder="e.g., 19.99"
                             />
                           </div>
                           <div>
                             <label className="block text-sm font-medium mb-2">Item Image (Optional - Leave empty to keep current)</label>
                             <input
                               type="file"
                               accept="image/*"
                               onChange={(e) => setEditItemForm({...editItemForm, menuImage: e.target.files?.[0] || null})}
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                             />
                           </div>
                         </div>
                         <div className="flex space-x-3 mt-4">
                           <button
                             onClick={handleUpdateItem}
                             className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                           >
                             Update Item
                           </button>
                           <button
                             onClick={() => {
                               setShowEditItemForm(false)
                               setEditingItem(null)
                               setEditItemForm({ name: '', price: '', menuImage: null })
                             }}
                             className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                           >
                             Cancel
                           </button>
                         </div>
                       </div>
                     )}
                   </div>
                 )) || (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No items yet. Click "Add Item" to add your first menu item.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
    
)}</div>)}

