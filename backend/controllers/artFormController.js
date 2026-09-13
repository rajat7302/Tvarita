import ArtForm from '../models/ArtForm.js';

export const getArtForms = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { status: 'verified' };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } }
      ];
    }

    // Non-popularity order (chronological/neutral)
    const artForms = await ArtForm.find(query).sort({ createdAt: -1 });
    res.json(artForms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getArtFormById = async (req, res) => {
  try {
    const artForm = await ArtForm.findById(req.params.id);
    if (!artForm) return res.status(404).json({ message: 'Art Form not found' });
    res.json(artForm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestArtForm = async (req, res) => {
  try {
    const { name, category, state, region, description } = req.body;
    const newArtForm = await ArtForm.create({
      name,
      category,
      state,
      region,
      description,
      status: 'pending'
    });
    res.status(201).json({ message: 'Art form requested for verification', artForm: newArtForm });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};