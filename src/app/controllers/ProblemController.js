import DeliveryProblem from '../models/DeliveryProblem';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Provider from '../models/Provider';
import Mail from '../../lib/Mail';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class ProblemController {
  async index(req, res) {
    const problems = await DeliveryProblem.findAll({
      include: {
        model: Delivery,
        as: 'delivery',
        attributes: [
          'id',
          'product',
          'recipient_id',
          'provider_id',
          'start_date',
        ],
        include: {
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
      },
    });

    return res.json(problems);
  }

  async show(req, res) {
    const { delivery_id } = req.params;

    const problems = await DeliveryProblem.findAll({
      where: {
        delivery_id,
      },
      include: {
        model: Delivery,
        as: 'delivery',
        attributes: [
          'id',
          'product',
          'recipient_id',
          'provider_id',
          'start_date',
        ],
        include: {
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
      },
    });
    return res.json(problems);
  }

  async store(req, res) {
    const { description } = req.body;
    const { delivery_id } = req.params;

    const problem = await DeliveryProblem.create({
      description,
      delivery_id,
    });

    return res.json(problem);
  }

  async delete(req, res) {
    const { problem_id } = req.params;

    const problem = await DeliveryProblem.findOne({
      where: {
        id: problem_id,
      },
      include: [
        {
          model: Delivery,
          as: 'delivery',
          include: [
            {
              model: Provider,
              as: 'provider',
            },
            {
              model: Recipient,
              as: 'destination',
            },
          ],
        },
      ],
    });

    if (!problem) {
      return res.status(400).json({ error: 'Invalid problem id!' });
    }

    const { name, email } = problem.delivery.provider;

    await Queue.add(CancellationMail.key, {
      name,
      email,
      problem,
    });

    const { delivery_id } = problem;

    await await Delivery.update(
      {
        canceled_at: new Date(),
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

export default new ProblemController();
