import express from 'express';
import cors from 'cors';

const app= express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: 'http://localhost:5173' }));

app.get('/', (req,res) => {
    res.json({message: 'Hello World!'});
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})