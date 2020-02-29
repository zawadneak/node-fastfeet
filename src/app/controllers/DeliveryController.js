import * as Yup from 'yup';
import { Op } from 'sequelize';
import { startOfDay, isBefore, isAfter, setHours, setMinutes } from 'date-fns';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Provider from '../models/Provider';
import File from '../models/File';

import DeliveryMail from '../jobs/DeliveryMail';
import Queue from '../../lib/Queue';

class DeliveryController {
  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      provider_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid or missing information' });
    }

    const { recipient_id, provider_id } = req.body;

    const isRecipientValid = await Recipient.findByPk(recipient_id);
    const isProviderValid = await Provider.findByPk(provider_id);

    if (!isRecipientValid) {
      return res.status(400).json({ error: 'The recipient id is not valid!' });
    }

    if (!isProviderValid) {
      return res.status(400).json({ error: 'The provider id is not valid!' });
    }

    const newDelivery = await Delivery.create(req.body);

    const { id, product, provider_id: pid, recipient_id: rid } = newDelivery;

    const { street, number, complement, city } = isRecipientValid;

    await Queue.add(DeliveryMail.key, {
      street,
      number,
      complement,
      city,
      isProviderValid,
      isRecipientValid,
      id,
    });

    return res.json({
      id,
      product,
      provider_id: pid,
      recipient_id: rid,
    });
  }

  async show(req, res) {
    const { provider_id } = req.params;

    const deliveries = await Delivery.findAll({
      where: {
        provider_id,
        canceled_at: null,
        end_date: null,
      },
      attributes: ['id', 'product', 'start_date', 'created_at'],
      include: [
        {
          model: Recipient,
          as: 'destination',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
          ],
        },
      ],
    });

    return res.json(deliveries);
  }

  async index(req, res) {
    const { q, page } = req.query;

    const deliveries = await Delivery.findAndCountAll({
      where: {
        product: {
          [Op.like]: `${q || ''}%`,
        },
      },
      order: [['id', 'DESC']],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: Recipient,
          as: 'destination',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
          ],
        },
        {
          model: Provider,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
      limit: 10,
      offset: page >= 1 ? (page - 1) * 10 : 0,
    });

    return res.json(deliveries.rows);
  }

  // When provider picks up the package

  async update(req, res) {
    const { delivery_id, provider_id } = req.params;

    const isProviderAuthorized = await Delivery.findOne({
      where: {
        id: Number(delivery_id),
        provider_id: Number(provider_id),
        canceled_at: null,
      },
    });

    if (!isProviderAuthorized) {
      return res
        .status(401)
        .json({ error: "The delivery and provider don't match" });
    }

    const deliveredCount = await Delivery.findAll({
      where: {
        provider_id,
        start_date: {
          [Op.between]: [startOfDay(new Date()), new Date()],
        },
      },
    });

    console.log(deliveredCount.length);
    if (deliveredCount >= 5) {
      return res
        .status(400)
        .json({ error: 'You have already picked up 5 packages' });
    }

    const date = new Date();

    let morningDate = setMinutes(date, 0);
    morningDate = setHours(morningDate, 8);

    let lateDate = setMinutes(date, 0);
    lateDate = setHours(morningDate, 18);

    const morningLimit = isBefore(morningDate, date);
    const lateLimit = isAfter(lateDate, date);

    if (!morningLimit || !lateLimit) {
      return res.status(401).json({
        error: 'Deliveries must be picked up between 8:00 and 18:00!',
      });
    }

    const value = { start_date: date };

    await Delivery.update(value, {
      where: {
        id: req.params.delivery_id,
      },
    });
    return res.json();
  }

  async delete(req, res) {
    const { id } = req.params;

    const isDeliveryValid = await Delivery.findByPk(id);

    if (!isDeliveryValid) {
      return res.status(400).json({ error: 'Invalid delivery!' });
    }

    await Delivery.destroy({ where: { id } });

    return res.send();
  }
}

export default new DeliveryController();
