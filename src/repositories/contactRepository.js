const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { Parser } = require('json2csv');
const { Readable } = require('stream');

class ContactRepository {

    // Paginate contacts
    async paginate({ page = 1, perPage = 10, sortBy = 'created_at', sortDirection = 'desc' }) {
        const skip = (page - 1) * perPage;
        const total = await prisma.contact.count();
        const contacts = await prisma.contact.findMany({
            orderBy: {
                [sortBy]: sortDirection,
            },
            skip,
            take: perPage,
        });

        return {
            data: contacts,
            page,
            perPage,
            total,
            totalPages: Math.ceil(total / perPage),
        };
    }

    // Create a new contact
    async createContact(data) {
        // Encode inform_by if array
        if (Array.isArray(data.inform_by)) {
            data.inform_by = JSON.stringify(data.inform_by);
        }
        return await prisma.contact.create({
            data
        });
    }

    // Find a contact by ID
    async findById(id) {
        return await prisma.contact.findUnique({
            where: { id: Number(id) }
        });
    }

    // Update a contact
    async update(id, data) {
        if (Array.isArray(data.inform_by)) {
            data.inform_by = JSON.stringify(data.inform_by);
        }
        return await prisma.contact.update({
            where: { id: Number(id) },
            data
        });
    }

    // Delete a contact
    async delete(id) {
        return await prisma.contact.delete({
            where: { id: Number(id) }
        });
    }

    // Export contacts as CSV
    async exportContactsToCSV() {
        const contacts = await prisma.contact.findMany();
        if (!contacts.length) return null;

        const fields = Object.keys(contacts[0]);
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(contacts);

        const stream = new Readable();
        stream.push(csv);
        stream.push(null);

        return stream;
    }
}

module.exports = new ContactRepository();
