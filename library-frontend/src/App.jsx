import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const statusLabels = {
  Available: 'Available',
  CheckedOut: 'Checked Out',
  Lost: 'Lost',
}

function App() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [donationForm, setDonationForm] = useState({
    title: '',
    materialType: 'Book',
    donorName: '',
  })

  const [checkoutForm, setCheckoutForm] = useState({
    materialId: '',
    borrowerName: '',
  })

  const [returnMaterialId, setReturnMaterialId] = useState('')
  const [lostMaterialId, setLostMaterialId] = useState('')

  const availableMaterials = useMemo(
    () => materials.filter((item) => item.state === 'Available'),
    [materials],
  )

  const checkedOutMaterials = useMemo(
    () => materials.filter((item) => item.state === 'CheckedOut'),
    [materials],
  )

  const activeMaterials = useMemo(
    () => materials.filter((item) => item.state !== 'Lost'),
    [materials],
  )

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    })

    if (response.status === 204) {
      return null
    }

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message =
        payload.message ||
        payload.title ||
        'Request failed. Please check your input and try again.'
      throw new Error(message)
    }

    return payload
  }

  async function loadMaterials() {
    setLoading(true)
    setError('')

    try {
      const data = await request('/api/materials')
      setMaterials(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMaterials()
  }, [])

  async function handleDonate(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    try {
      await request('/api/materials/donate', {
        method: 'POST',
        body: JSON.stringify(donationForm),
      })

      setDonationForm({ title: '', materialType: 'Book', donorName: '' })
      setNotice('Donation recorded successfully.')
      await loadMaterials()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCheckout(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!checkoutForm.materialId) {
      setError('Select an available item to check out.')
      return
    }

    try {
      await request(`/api/materials/${checkoutForm.materialId}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ borrowerName: checkoutForm.borrowerName }),
      })

      setCheckoutForm({ materialId: '', borrowerName: '' })
      setNotice('Checkout completed.')
      await loadMaterials()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleReturn(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!returnMaterialId) {
      setError('Select a checked out item to return.')
      return
    }

    try {
      await request(`/api/materials/${returnMaterialId}/return`, {
        method: 'POST',
      })
      setReturnMaterialId('')
      setNotice('Material returned and available again.')
      await loadMaterials()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleLost(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!lostMaterialId) {
      setError('Select a material to mark as lost.')
      return
    }

    try {
      await request(`/api/materials/${lostMaterialId}/lost`, {
        method: 'POST',
      })
      setLostMaterialId('')
      setNotice('Material has been marked as lost.')
      await loadMaterials()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">Neighborhood Library Desk</p>
        <h1>Material Flow Console</h1>
        <p className="hero-copy">
          Manage donated materials and circulation in one view. Donate items,
          check them out, process returns, and mark lost inventory.
        </p>
      </header>

      <section className="status-strip" aria-label="library status overview">
        <article>
          <h2>Total Materials</h2>
          <p>{materials.length}</p>
        </article>
        <article>
          <h2>Available</h2>
          <p>{availableMaterials.length}</p>
        </article>
        <article>
          <h2>Checked Out</h2>
          <p>{checkedOutMaterials.length}</p>
        </article>
      </section>

      {(error || notice) && (
        <section className="feedback" aria-live="polite">
          {error && <p className="error">{error}</p>}
          {notice && <p className="notice">{notice}</p>}
        </section>
      )}

      <section className="action-grid">
        <form className="panel" onSubmit={handleDonate}>
          <h2>Donate Material</h2>
          <label>
            Title
            <input
              type="text"
              value={donationForm.title}
              onChange={(event) =>
                setDonationForm((previous) => ({
                  ...previous,
                  title: event.target.value,
                }))
              }
              required
            />
          </label>
          <label>
            Type
            <select
              value={donationForm.materialType}
              onChange={(event) =>
                setDonationForm((previous) => ({
                  ...previous,
                  materialType: event.target.value,
                }))
              }
            >
              <option>Book</option>
              <option>Magazine</option>
              <option>DVD</option>
              <option>Equipment</option>
            </select>
          </label>
          <label>
            Donor Name
            <input
              type="text"
              value={donationForm.donorName}
              onChange={(event) =>
                setDonationForm((previous) => ({
                  ...previous,
                  donorName: event.target.value,
                }))
              }
              placeholder="Optional"
            />
          </label>
          <button type="submit">Add Donation</button>
        </form>

        <form className="panel" onSubmit={handleCheckout}>
          <h2>Check Out Material</h2>
          <label>
            Material
            <select
              value={checkoutForm.materialId}
              onChange={(event) =>
                setCheckoutForm((previous) => ({
                  ...previous,
                  materialId: event.target.value,
                }))
              }
            >
              <option value="">Select available material</option>
              {availableMaterials.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Borrower Name
            <input
              type="text"
              value={checkoutForm.borrowerName}
              onChange={(event) =>
                setCheckoutForm((previous) => ({
                  ...previous,
                  borrowerName: event.target.value,
                }))
              }
              required
            />
          </label>
          <button type="submit">Confirm Checkout</button>
        </form>

        <form className="panel" onSubmit={handleReturn}>
          <h2>Return Material</h2>
          <label>
            Checked Out Item
            <select
              value={returnMaterialId}
              onChange={(event) => setReturnMaterialId(event.target.value)}
            >
              <option value="">Select checked out material</option>
              {checkedOutMaterials.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.checkedOutBy})
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Process Return</button>
        </form>

        <form className="panel" onSubmit={handleLost}>
          <h2>Declare Material Lost</h2>
          <label>
            Material
            <select
              value={lostMaterialId}
              onChange={(event) => setLostMaterialId(event.target.value)}
            >
              <option value="">Select active material</option>
              {activeMaterials.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="danger">
            Mark Lost
          </button>
        </form>
      </section>

      <section className="inventory panel">
        <h2>Inventory Snapshot</h2>
        {loading ? (
          <p>Loading materials...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Borrower</th>
                  <th>Donor</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.materialType}</td>
                    <td>
                      <span className={`status ${item.state.toLowerCase()}`}>
                        {statusLabels[item.state]}
                      </span>
                    </td>
                    <td>{item.checkedOutBy ?? '—'}</td>
                    <td>{item.donorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
