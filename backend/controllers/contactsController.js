const db = require('../database');

// Add new contact
exports.addContact = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, type, num, username } = req.body;

        const addContactQuery = 'INSERT INTO contacts (name, type, num, user_id, username) VALUES (?, ?, ?, ?, ?)';
        await db.execute(addContactQuery, [name, type, num, userId, username]);

        res.status(201).json({ message: 'Contact added successfully' });
    } catch (error) {
        console.error('Error adding contact:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    } 
};

// Get all contacts
exports.getContacts = async (req, res) => {
    try {
        const userId = req.userId;

        const getAllContactsQuery = 'SELECT * FROM contacts WHERE user_id = ?';
        const [contacts] = await db.execute(getAllContactsQuery, [userId]);

        res.json(contacts);
    } catch (error) {
        console.error('Error getting contacts:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get contact by id
exports.getContact = async (req, res) => {
    try {
        const userId = req.userId;
        const contactId = req.params.id;

        const getContactQuery = 'SELECT * FROM contacts WHERE id = ? AND user_id = ?';
        const [contact] = await db.execute(getContactQuery, [contactId, userId]);

        if (contact.length === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json(contact[0]);
    } catch (error) {
        console.error('Error getting contact by id:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update contact
exports.updateContact = async (req, res) => {
    try {
        const userId = req.userId;
        const contactId = req.params.id;
        const { name, type, num, username } = req.body;

        const updateContactQuery = 'UPDATE contacts SET name = ?, type = ?, num = ?, username = ? WHERE id = ? AND user_id = ?';
        const [result] = await db.execute(updateContactQuery, [name, type, num, username, contactId, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Contact not found or unauthorized' });
        }

        res.json({ message: 'Contact updated successfully' });
    } catch (error) {
        console.error('Error updating contact:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete contact
exports.deleteContact = async (req, res) => {
    try {
        const userId = req.userId;
        const contactId = req.params.id;

        const deleteContactQuery = 'DELETE FROM contacts WHERE id = ? AND user_id = ?';
        const [result] = await db.execute(deleteContactQuery, [contactId, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Contact not found or unauthorized' });
        }

        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};