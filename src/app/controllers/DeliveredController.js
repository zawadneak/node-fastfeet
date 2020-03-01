import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';

class DeliveredController {
  async index(req, res) {
    const { provider_id } = req.params;

    const delivered = await Delivery.findAll({
      where: {
        provider_id,
        canceled_at: null,
        end_date: {
          [Op.between]: [new Date(0), new Date()],
        },
      },
      attributes: ['id', 'product', 'start_date', 'end_date', 'created_at'],
      order: [['end_date', 'desc']],
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
            'postalCode',
          ],
        },
      ],
    });

    return res.json(delivered);
  }

  async update(req, res) {
    const { delivery_id, provider_id } = req.params;

    const { signature_id } = req.body;

    const isProviderAuthorized = await Delivery.findOne({
      where: {
        id: delivery_id,
        provider_id,
        start_date: {
          [Op.between]: [new Date(0), new Date()],
        },
        end_date: null,
        canceled_at: null,
      },
    });

    if (!isProviderAuthorized) {
      return res
        .status(401)
        .json({ error: "You cant't deliver this package!" });
    }

    await Delivery.update(
      {
        signature_id: signature_id || null,
        end_date: new Date(),
      },
      {
        where: {
          id: delivery_id,
        },
      }
    );

    return res.send();
  }
}

export default new DeliveredController();
