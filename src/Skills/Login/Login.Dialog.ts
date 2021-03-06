
import builder = require('botbuilder');
import { BotWrapper } from "../../bot";

import { LoginService } from './Login.Service';
import { LoginSkill } from './Login.Skill';
import { LoginMessage } from './Login.Message';
import { StartMessage } from '../Start/Start.Message';

export class LoginDialog {

    static register = function (wrapper: BotWrapper) {
        wrapper.bot.dialog(LoginSkill.Dialogs.Login, [
            function (session: builder.Session, args: any) {
                if (!session.privateConversationData.name) {
                    // call custom prompt
                    session.beginDialog(LoginSkill.Dialogs.Authenticate, {
                        prompt: StartMessage.promptForName(session),
                        retryPrompt: LoginMessage.announceNameIsInvalid()
                    });
                } else {
                    session.endDialog(LoginMessage.respondAlreadyLoggedIn(session.privateConversationData.name));
                }
            },
            function (session: builder.Session, results: any) {
                // Check their name
                if (results.response) {
                    // console.log('got valid name: ', results.response)
                    const name = results.response;
                    LoginService.saveName(session, name);
                    session.send(StartMessage.welcomeByName(name));
                } else {
                    // session.send(LoginMessage.announceNameIsInvalid());
                }
                session.endDialog();
            }
        ]).triggerAction({
            matches: /(L|l)ogin/i
        });

        wrapper.bot.dialog(LoginSkill.Dialogs.Authenticate,
            builder.DialogAction.validatedPrompt(
                builder.PromptType.text, (name: string): boolean => {
                    //auths any name
                    return (/[a-z]/i).test(name.toLowerCase());
                }));
    };

}


