import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeModification } from "../middleware/authorize.js";
import { readWatchlists, writeWatchlists } from "../utils/db.js";

const router = Router();
router.use(authenticate);

router.get("/:userId", (req, res) => {
  const watchlists = readWatchlists();
  res.status(200).json(watchlists[req.params.userId] || []);
});

router.post("/:userId/movies", authorizeModification, (req, res) => {
  const watchlists = readWatchlists();
  const { userId } = req.params;
  const list = watchlists[userId] || [];
  const newMovie = { id: Date.now(), ...req.body };
  list.push(newMovie);
  watchlists[userId] = list;
  writeWatchlists(watchlists);
  res.status(201).json(newMovie);
});

router.put("/:userId/movies/:movieId", authorizeModification, (req, res) => {
  const watchlists = readWatchlists();
  const { userId, movieId } = req.params;
  const list = watchlists[userId] || [];
  const i = list.findIndex((m) => String(m.id) === String(movieId));
  if (i === -1) return res.status(404).json({ error: "Movie not found." });
  list[i] = { ...list[i], ...req.body };
  watchlists[userId] = list;
  writeWatchlists(watchlists);
  res.status(200).json(list[i]);
});

router.delete("/:userId/movies/:movieId", authorizeModification, (req, res) => {
  const watchlists = readWatchlists();
  const { userId, movieId } = req.params;
  watchlists[userId] = (watchlists[userId] || []).filter(
    (m) => String(m.id) !== String(movieId)
  );
  writeWatchlists(watchlists);
  res.status(200).json(watchlists[userId]);
});

export default router;