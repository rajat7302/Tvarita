import ArtForm from '../models/ArtForm.js';

export const getArtForms = async (req, res) => {
  try {
    const { category, search } = req.query;

    // Filter by boolean flag matching your schema (isApproved: true)
    let query = { isApproved: true };

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

    // Chronological sort
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
    const { name, category, state, region, description, imageUrl, isUnderrepresented } = req.body;

    // Build the images array based on Multer upload or direct URL fallback
    let imageList = [];

    if (req.file) {
      // Multer-Cloudinary sets path/secure_url, local disk storage sets path
      imageList.push(req.file.path || req.file.secure_url);
    } else if (imageUrl && imageUrl.trim()) {
      imageList.push(imageUrl.trim());
    }

    const newArtForm = await ArtForm.create({
      name,
      category,
      state,
      region,
      description,
      images: imageList, // Matches 'images: [String]' in schema
      isUnderrepresented: isUnderrepresented !== undefined ? Boolean(isUnderrepresented) : true,
      isApproved: false  // Matches 'isApproved: Boolean' in schema
    });

    res.status(201).json({
      message: 'Art form requested for verification',
      artForm: newArtForm
    });
  } catch (error) {
    console.error('Request Art Form Error:', error);
    res.status(400).json({ message: error.message });
  }
};