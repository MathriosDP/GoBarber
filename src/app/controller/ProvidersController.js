import User from '../models/User';
import File from '../models/File';

class ProvidersController {
  async index(req, res) {
    const users = await User.findAll({
      where: { provider: true },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(users);
  }
}

export default new ProvidersController();
