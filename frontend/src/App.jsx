import { useState } from "react"

function App() {
  const [image, setImage] = useState(null)
  const [grams, setGrams] = useState(250)

  function handleImageChange(event) {
    const file = event.target.files[0]
    setImage(file)
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
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData
      })

      const data = await response.json()
      console.log(data)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <div>
      <h1>Food Calorie Estimator</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />

      {image && <p>Selected image: {image.name}</p>}

      <label>
        Portion size: {grams} g
      </label>

      <input
        type="range"
        min="1"
        max="2000"
        step="10"
        value={grams}
        onChange={(e) => setGrams(Number(e.target.value))}
      />

      <br /><br />

      <button onClick={handleSubmit}>
        Analyze
      </button>
    </div>
  )
}

export default App
