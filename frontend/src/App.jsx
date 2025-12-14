import { useState } from "react"
import "./App.css"

function App() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [grams, setGrams] = useState(250)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleImageChange(event) {
    const file = event.target.files[0]
    if (!file) return

    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null) // reset rezultat la imagine noua
  }

  async function handleSubmit() {
    if (!image) {
      alert("Please select an image first")
      return
    }

    const formData = new FormData()
    formData.append("file", image)
    formData.append("grams", grams)

    try {
      setLoading(true)

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Food Calorie Estimator</h1>
      <p className="subtitle">
        Upload a food image and select portion size
      </p>

      {/* UPLOAD */}
      <label className="upload-box">
        Click to upload image
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </label>

      {/* IMAGE PREVIEW */}
      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Food preview" />
        </div>
      )}

      {/* PORTION CONTROLS */}
      <div className="control-group">
        <label>Portion size</label>

        <div className="grams-value">{grams} g</div>

        <input
          type="range"
          min="50"
          max="1000"
          step="25"
          value={grams}
          onChange={(e) => setGrams(Number(e.target.value))}
        />

        <input
          type="number"
          min="1"
          max="2000"
          value={grams}
          onChange={(e) => setGrams(Number(e.target.value))}
        />
      </div>

      {/* BUTTON */}
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {/* RESULT */}
      {result && (
        <div className="result">
          <p><strong>Food:</strong> {result.prediction}</p>
          <p><strong>Portion:</strong> {result.grams} g</p>
          <p className="calories">
            {result.calories} kcal
          </p>
        </div>
      )}
    </div>
  )
}

export default App
