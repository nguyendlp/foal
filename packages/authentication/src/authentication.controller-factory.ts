import {
  Class,
  Controller,
  HttpResponseOK,
  HttpResponseRedirect,
  HttpResponseUnauthorized,
  IServiceControllerFactory,
} from '@foal/core';

import { IAuthenticator } from './authenticator.interface';

export class AuthenticationFactory implements IServiceControllerFactory {
  public attachService(path: string, ServiceClass: Class<IAuthenticator<any>>,
                       options: { failureRedirect?: string, successRedirect?: string } = {}):
                       Controller<'main'> {
    const controller = new Controller<'main'>(path);
    controller.addRoute('main', 'POST', '', async (ctx, services) => {
      const user = await services.get(ServiceClass).authenticate(ctx.body);

      if (user === null) {
        if (options.failureRedirect) {
          return new HttpResponseRedirect(options.failureRedirect);
        }
        return new HttpResponseUnauthorized({ message: 'Bad credentials.' });
      }

      ctx.session.authentication = ctx.session.authentication || {};
      ctx.session.authentication.userId = user.id || user._id;

      if (options.successRedirect) {
        return new HttpResponseRedirect(options.successRedirect);
      }
      return new HttpResponseOK(user); // C'est pas tip top le user la.
    });
    return controller;
  }

  public attachLogout(path: string,
                      options: { redirect?: string, httpMethod?: 'GET'|'POST' } = {}): Controller<'main'> {
    const controller = new Controller<'main'>(path);
    controller.addRoute('main', options.httpMethod || 'GET', '', async ctx => {
      delete ctx.session.authentication;
      if (options.redirect) {
        return new HttpResponseRedirect(options.redirect);
      }
      return new HttpResponseOK();
    });
    return controller;
  }
}

export const authentication = new AuthenticationFactory();
