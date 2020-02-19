import * as Yup from 'yup';
import { Op } from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number()
        .positive()
        .required(),
      complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      postalCode: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid or missing information!' });
    }

    const recipientName = req.body.name;

    const findRecipient = await Recipient.findOne({
      where: { name: recipientName },
    });

    if (!findRecipient) {
      const recipient = await Recipient.create(req.body);

      const { id, name, street, number, state, city, postalCode } = recipient;

      return res.json({ id, name, street, number, state, city, postalCode });
    }

    return res.status(400).json({ error: 'Recipient already exists!' });
  }

  async update(req, res) {
    let name = null;

    if (req.body.name) {
      name = req.body.name;
    }

    const { id } = req.params;

    const idCheck = await Recipient.findByPk(id);

    if (!id || !idCheck) {
      return res.status(400).json({ error: 'Invalid recipient id!' });
    }

    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number().positive(),
      complement: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      postalCode: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid or missing information!' });
    }

    if (name) {
      const findRecipient = await Recipient.findOne({ where: { name } });
      if (findRecipient) {
        return res.status(400).json({ error: 'Recipient already exists!' });
      }
    }

    await Recipient.update(req.body, { where: { id } }).then(() => {
      console.log('Updated!');
    });
    return res.send();
  }

  async delete(req, res) {
    const { id } = req.params;

    const idCheck = await Recipient.findByPk(id);

    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.params)) || !idCheck) {
      return res.status(400).json({ error: 'Invalid recipient id!' });
    }

    await Recipient.destroy({ where: { id } });

    return res.send();
  }

  async index(req, res) {
    const { q, page } = req.query;
    const recipients = await Recipient.findAndCountAll({
      where: {
        name: {
          [Op.like]: `${q || ''}%`,
        },
      },
      limit: 10,
      offset: page >= 1 ? (page - 1) * 10 : 0,
    });

    return res.json(recipients.rows);
  }
}

export default new RecipientController();
