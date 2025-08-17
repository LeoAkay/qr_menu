'use client'

import { useState, useEffect, useRef } from 'react' 
import { useRouter, useSearchParams } from 'next/navigation'

// Utility function to format prices with thousand separators
const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

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
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)


  const [categoryForm, setCategoryForm] = useState({
    name: '',
  })

  const [itemForm, setItemForm] = useState({
    name: '',
    price: '',
    description: '',
    stock: true,
    menuImage: null as File | null
  })

  const [editCategoryForm, setEditCategoryForm] = useState({
    name: '',
  })

  const [editItemForm, setEditItemForm] = useState({
    name: '',
    price: '',
    description: '',
    stock: true,
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
      const userId = localStorage.getItem('userId');

      const res = await fetch('/api/AdminPanel/company/show/category', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (res.ok) {
        alert('Category added successfully!')
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
      // Always send description to ensure it gets saved properly
      formData.append('description', itemForm.description || '')
      // Always send stock
      formData.append('stock', itemForm.stock ? 'true' : 'false')
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
          name: '', price: '',description: '',stock:true, menuImage: null
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
    })
    setShowEditCategoryForm(true)
  }

  const handleEditItem = (item: any) => {
    setEditingItem(item)
    setEditItemForm({
      name: item.name,
      price: item.price?.toString() || '',
      description: item.description || '',
      stock: item.stock !== undefined ? item.stock : true,
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
  
    const res = await fetch(
      `/api/AdminPanel/company/show/category?categoryId=${editingCategory.id}&cId=${cId}`,
      {
        method: 'PUT',
        body: formData,
      }
    )

    if (res.ok) {
      alert('Category updated successfully!')
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
    // Always send description to ensure it gets updated properly
    formData.append('description', editItemForm.description || '')
    // Always send stock
    formData.append('stock', editItemForm.stock ? 'true' : 'false')
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
      setEditItemForm({ name: '', price: '', description: '', stock: true, menuImage: null })
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
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit Item Modal - REMOVED */}

        {/* Categories List */}
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
      <div key={category.id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-md">
        {/* Category Header */}
<div
  className="flex justify-between items-center mb-4 cursor-pointer"
  onClick={() =>
    setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id)
  }
>
  <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
    {category.name}
    <svg
      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
        expandedCategoryId === category.id ? 'rotate-180' : ''
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </h3>

  <div className="flex space-x-2">
    <button
      onClick={(e) => {
        e.stopPropagation();
        setShowItemForm(showItemForm === category.id ? null : category.id);
      }}
      className="flex items-center bg-blue-400 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium transition-shadow shadow-sm hover:shadow-md"
    >
      + Item
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleEditCategory(category);
      }}
      className="flex items-center bg-amber-400 hover:bg-amber-500 text-white px-3 py-1 rounded-lg text-sm font-medium transition-shadow shadow-sm hover:shadow-md"
    >
      Edit
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteCategory(category.id, category.name);
      }}
      className="flex items-center bg-rose-400 hover:bg-rose-500 text-white px-3 py-1 rounded-lg text-sm font-medium transition-shadow shadow-sm hover:shadow-md"
    >
      Delete
    </button>
  </div>
</div>


        {/* Add Item Form */}
        {showItemForm === category.id && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
            <h4 className="text-lg font-medium">Add New Item to {category.name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="Item Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <input
                type="number"
                step="0.01"
                value={itemForm.price}
                onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                placeholder="Price (₺)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setItemForm({ ...itemForm, menuImage: e.target.files?.[0] || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleAddItem(category.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Save Item
              </button>
              <button
                onClick={() => setShowItemForm(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Items List (Dropdown) */}
        {expandedCategoryId === category.id && (
          <div className="space-y-3">
            {category.subCategories?.length ? (
              category.subCategories.map((item: any) => (
                <div
                  key={item.id}
                  className={`border border-gray-100 rounded-lg p-4 bg-gray-50 flex justify-between items-center ${
                    highlightedItemId === item.id ? "ring-4 ring-purple-400" : ""
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {item.menuImageUrl && (
                      <img
                        src={`/api/QR_Panel/user/manual-menu/image/${item.id}`}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg "
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      {item.price && <p className="text-green-600 font-bold">₺{Number(item.price).toFixed(2)}</p>}
                      {item.description && <p className="text-gray-600 text-sm italic">{item.description}</p>}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="bg-amber-400 hover:bg-amber-500 text-white px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      className="bg-rose-400 hover:bg-rose-500 text-white px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No items yet. Click "Add Item" to add your first menu item.
              </p>
            )}
          </div>
        )}
      </div>
    ))}
  </div>
)}

    </div>
    </div>
    
)}</div>)}

