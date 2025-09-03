// controllers/settingsController.js

/**
 * @desc    Get user settings
 * @route   GET /api/settings
 * @access  Private
 */
const getSettings = async (req, res) => {
  try {
    // In a real application, you would fetch settings for the logged-in user from the database.
    // The user ID is available from the auth middleware via req.user.uid.
    const userId = req.user.uid;
    console.log(`Fetching settings for user: ${userId}`);
    
    // Mock data for demonstration purposes.
    const mockSettings = {
      profile: {
        companyName: "ESA Billing Inc.",
        contactEmail: req.user.email || "admin@esabilling.com",
        address: "123 Business Avenue, Coimbatore, India",
      },
      invoice: {
        defaultTerms: "Payment due within 30 days.",
        logoUrl: "https://example.com/logo.png",
      },
      notifications: {
        emailOnPayment: true,
        emailOnInvoiceDue: false,
      },
    };

    res.status(200).json(mockSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Server error while fetching settings." });
  }
};

/**
 * @desc    Update user settings
 * @route   PUT /api/settings
 * @access  Private
 */
const updateSettings = async (req, res) => {
  try {
    // In a real application, you would validate the req.body and update the user's settings in the database.
    const userId = req.user.uid;
    const newSettings = req.body;
    
    console.log(`Updating settings for user: ${userId} with data:`, newSettings);

    // As a placeholder, we'll just return the "updated" settings.
    res.status(200).json({
      message: "Settings updated successfully!",
      settings: newSettings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Server error while updating settings." });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};

