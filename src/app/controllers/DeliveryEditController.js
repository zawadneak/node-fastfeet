import * as Yup from 'yup';
import Delivery from '../models/Delivery';

class DeliveryController {
  async update(req, res) {
    const { delivery_id } = req.params;
    const { provider_id, product, recipient_id } = req.body;

    const data = { product, provider_id, recipient_id, delivery_id };

    const schema = Yup.object().shape({
      delivery_id: Yup.number().required(),
      provider_id: Yup.number(),
      product: Yup.string(),
      recipient_id: Yup.number(),
    });

    if (!(await schema.isValid(data))) {
      return res.status(401).json({ error: 'Invalid information!' });
    }

    const deliveryCanceled = await Delivery.findOne({
      where: {
        id: Number(delivery_id),
        canceled_at: null,
      },
    });

    if (!deliveryCanceled) {
      return res.status(401).json({ error: 'The delivery has been canceled!' });
    }

    await Delivery.update(data, {
      where: {
        id: req.params.delivery_id,
      },
    });
    return res.status(200).json();
  }
}

export default new DeliveryController();
