require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.use(cors());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const UserScoreSchema = new mongoose.Schema(
  {
    username: String,
    score: Number,
  },
  { timestamps: true }
);

const UserScore = mongoose.model("UserScore", UserScoreSchema);


app.post("/submit-score", async (req, res) => {
  const { username, score } = req.body;
  try {
    const existingScore = await UserScore.findOne({ username });
    if (existingScore) {
      if (score > existingScore.score) {
        existingScore.score = score;
        await existingScore.save();
        res
          .status(200)
          .json({ message: "Score updated successfully", existingScore });
      } else {
        res
          .status(200)
          .json({
            message: "Score not updated. New score is not higher.",
            existingScore,
          });
      }
    } else {
      const newScore = await UserScore.create({ username, score });
      res.status(201).json(newScore);
    }
  } catch (error) {
    res.status(400).json({ error: "Error processing score submission" });
  }
});


app.get("/high-scores", async (req, res) => {
  try {
    console.log("lol")
    const scores = await UserScore.find({}).sort({ score: -1 }).limit(1000); 
    console.log(scores);
    res.status(200).json(scores);
  } catch (error) {
    res.status(400).json({ error: "Error fetching high scores" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
