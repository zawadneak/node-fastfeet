import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import authConfig from '../../config/auth'


class SessionController {
  async store(req,res){
    const { email,password } = req.body;

    const schema = Yup.object().shape({
      email: Yup.string().required(),
      password: Yup.string().required(),
    })

    if(!(await schema.isValid(req.body))){
      return res.status(400).json({error:'Invalid or missing information!'})
    }

    const user = await User.findOne({where:{ email }});

    if(!user){
      return res.status(400).json({error:'User does not exist!'});
    }

    if(!user.checkPassword(password)){
      return res.status(401).json({error: 'Invalid Password'});
    }

    return res.json({
      token: jwt.sign({id: user.dataValues.id},
        authConfig.secret,
        {
          expiresIn: authConfig.expiresIn
      })
    })
  }

}

export default new SessionController();
