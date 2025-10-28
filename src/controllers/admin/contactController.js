const ContactRepository = require('../repositories/contactRepository');
const { contactCreateValidator, contactUpdateValidator } = require('../validators/contactValidator');

class ContactController {
    constructor() {
        this.repository = new ContactRepository();
    }

    // List contacts
    async index(req, res) {
        try {
            const sortDirection = req.query.sortDirection || 'desc';
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.perPage) || 10;

            const contacts = await this.repository.paginate({ page, perPage, sortBy: 'created_at', sortDirection });

            res.json({ data: contacts });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Store new contact
    async store(req, res) {
        try {
            // Validate input
            await contactCreateValidator(req.body);

            // Prepare data
            const data = {
                ...req.body,
                inform_by: JSON.stringify(req.body.informBY || [])
            };

            const contact = await this.repository.createContact(data);

            res.json({
                message: 'Thank you! We have successfully received your submission and will be in touch shortly.',
                data: contact
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Show single contact
    async show(req, res) {
        try {
            const id = req.params.id;
            const contact = await this.repository.findById(id);

            if (!contact) return res.status(404).json({ error: 'Contact not found' });

            res.json({ data: contact });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Edit contact (fetch for editing)
    async edit(req, res) {
        try {
            const id = req.params.id;
            const contact = await this.repository.findById(id);

            if (!contact) return res.status(404).json({ error: 'Contact not found' });

            res.json({ data: contact });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update contact
    async update(req, res) {
        try {
            const id = req.params.id;

            await contactUpdateValidator(req.body);

            const contact = await this.repository.update(id, req.body);

            res.json({ message: 'Contact updated.', data: contact });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Delete contact
    async destroy(req, res) {
        try {
            const id = req.params.id;

            const deleted = await this.repository.delete(id);

            res.json({ message: 'Contact deleted.', deleted });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Export contacts as CSV
    async exportContacts(req, res) {
        try {
            const csvStream = await this.repository.exportContactsToCSV();

            const filename = `contacts_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            csvStream.pipe(res);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ContactController();
