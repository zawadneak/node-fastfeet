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
      attributes: ['id', 'product', 'start_date', 'end_date'],
      order: [['end_date', 'desc']],
      include: [
        {
          model: Recipient,
          as: 'destination',
          attributes: ['id', 'name', 'postal_code', 'city'], // Address not included for recipient safety issues!
        },
      ],
    });

    return res.json(delivered);
  }
}

export default new DeliveredController();
