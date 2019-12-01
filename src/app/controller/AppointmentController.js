import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import Apppointment from '../models/Appointment';
import File from '../models/File';
import Notification from '../schemas/Notifications';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Apppointment.findAll({
      where: { provider_id: req.userId },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
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
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails' });
    }

    const { provider_id, date } = req.body;

    /**
     * Check if provider_id is a provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }

    const hourStart = startOfHour(parseISO(date));

    /**
     * Check for past date
     */
    if (isBefore(hourStart, new Date())) {
      return res.status(401).json({ error: 'Past dates are not permitted' });
    }

    /**
     * Check date availablity
     */
    const dateAvailability = await Apppointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (dateAvailability) {
      return res
        .status(401)
        .json({ error: 'Appointment date is not available' });
    }

    const appointment = await Apppointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });

    /**
     * Notify appointiment provider
     */
    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às 'H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Apppointment.findByPk(req.params.id);

    if (req.userId !== appointment.provider_id) {
      return res.status(401).json({
        error:
          "You don't have perission. Just providers can delete one appointment.",
      });
    }

    const dataWithSub = subHours(appointment.date, 2);

    if (isBefore(dataWithSub, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel appointments two hours in advance',
      });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    return res.json(appointment);
  }
}

export default new AppointmentController();