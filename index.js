const { GoogleGenerativeAI } = require('@google/generative-ai')

const express = require('express')
const dotenv = require('dotenv')
dotenv.config();
const app = express()
const port = process.env.PORT || 3001

app.use(express.json())
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const fs = require('fs')
const path = require('path')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash'
})

// endpoint
// Read text
app.post("/generate-text", async (req, res) => {
  const { prompt } = req.body
  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    res.status(200).json({ output: text })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'An error occurred while generating text.' })
  }
})

// generate image
const imageGenerativePart = (filePath, mimeType) => ({
  inlineData: {
    data: fs.readFileSync(filePath).toString('base64'),
    mimeType: mimeType
  }
})

// Read Image
app.post("/generate-from-image", upload.single('image'), async (req, res) => {
  const { prompt } = req.body
  const image = imageGenerativePart(req.file.path, req.file.mimetype)
    try {

        const result = await model.generateContent([prompt, image])
        const response = result.response
        const text = response.text()

        res.status(200).json({ output: text })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while generating text from image.' });
    } finally {
        fs.unlinkSync(req.file.path)
    }
})

// Read Document
app.post("/generate-from-document", upload.single('document'), async (req, res) => {
  const prompt = req.body.prompt || 'Analyze this document :'
  const document = imageGenerativePart(req.file.path, req.file.mimetype)
  try {
    const result = await model.generateContent([prompt, document])
    const response = result.response
    const text = response.text()

    res.status(200).json({ output: text })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'An error occurred while generating text from document.' });
  } finally {
    fs.unlinkSync(req.file.path);
  }
})

// Read audio
app.post("/generate-from-audio", upload.single('audio'), async (req, res) => {
  const prompt = req.body.prompt || 'Analyze this audio :'
  const audio = imageGenerativePart(req.file.path, req.file.mimetype)

  try {
    const result = await model.generateContent([prompt, audio])
    const response = result.response
    const text = response.text()

    res.status(200).json({ output: text })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'An error occurred while generating text from audio.' });
  } finally {
    fs.unlinkSync(req.file.path)
  }
})

app.listen(port, () => {
  console.log('Server running in ', port)
})