import * as Yup from 'yup';
import { Op } from 'sequelize';
import Provider from '../models/Provider';
import File from '../models/File';

class ProviderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid or missing information!' });
    }

    const { email: providerEmail } = req.body;

    const checkProvider = await Provider.findOne({
      where: { email: providerEmail },
    });

    if (checkProvider) {
      return res.status(400).json({ error: 'User already exists!' });
    }

    const provider = await Provider.create(req.body);

    return res.json(provider);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      avatar_id: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid or missing information!' });
    }
    const { email, avatar_id } = req.body;

    const isAvatarIdValid = await File.findOne({ where: { id: avatar_id } });

    if (!isAvatarIdValid) {
      return res.status(400).json({ error: 'Invalid image id!' });
    }

    const { id } = req.params;

    if (req.body.email) {
      const emailSearch = await Provider.findOne({
        where: { email },
      });
      if (!emailSearch) {
        await Provider.update(req.body, { where: { id } });
        return res.send();
      }
      return res.status(400).json({ error: 'User already exists!' });
    }

    await Provider.update(req.body, { where: { id } });

    return res.send();
  }

  async index(req, res) {
    const { q, page, limit } = req.query;
    const providers = await Provider.findAndCountAll({
      where: {
        name: {
          [Op.like]: `${q || ''}%`,
        },
      },
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
      order: [['id', 'DESC']],
      limit: limit || 10,
      offset: page >= 1 ? (page - 1) * 10 : 0,
    });

    return res.json(providers.rows);
  }

  async delete(req, res) {
    const { id } = req.params;

    const isProviderValid = await Provider.findByPk(id);

    if (!isProviderValid) {
      return res.status(400).json({ error: 'Invalid provider!' });
    }

    await Provider.destroy({ where: { id } });

    return res.send();
  }

  async show(req, res) {
    const { id } = req.params;

    if (id === 'null') {
      return res.status(400).json({ error: 'Null ID!' });
    }

    const findProvider = await Provider.findByPk(id, {
      attributes: ['id', 'name', 'email', 'created_at'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['path', 'url'],
        },
      ],
    });

    if (!findProvider) {
      return res.status(400).json({ error: 'Invalid ID!' });
    }

    return res.json(findProvider);
  }
}

export default new ProviderController();
