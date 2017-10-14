import builder = require("botbuilder");

import { RootSkill } from "./Skills/Root/Root.Skill";
import { LoginSkill } from "./Skills/Login/Login.Skill";
import { SampleSkill } from "./Skills/Sample/Sample.Skill";

import config = require("./config");

export class Bot {
  /**
     * Connector to use
     * @type {(builder.ConsoleConnector | builder.ChatConnector)}
     * @memberOf Bot
     */
  private bot: builder.UniversalBot;
  private recognizer: builder.LuisRecognizer;

  constructor(public connector: builder.IConnector) {
    this.bot = new builder.UniversalBot(connector);
    this.setUp();

    console.log(
      !process.env.MICROSOFT_APP_ID
        ? "WARNING: Starting bot without ID or Secret"
        : `Bot started with App Id ${process.env.MICROSOFT_APP_ID}`
    );

    console.log("Registering dialogs...");
    this.registerDialogs();

    // if (this.bot instanceof builder.ChatConnector) {
    this.init();
    // }
  }

  private setUp() {
    const url = config.luis.url
      .replace("##APP##", config.luis.app)
      .replace("##KEY##", config.luis.key);
    this.recognizer = new builder.LuisRecognizer(url);
    this.bot.recognizer(this.recognizer);
  }

  private init() {
    console.log("Initializing...");
    // this.dialog.onDefault(builder.DialogAction.send(config.dialogs.speech.iDontUnderstand));
    //Initiate welcome message
    this.bot.on("conversationUpdate", message => {
      if (message.membersAdded) {
        message.membersAdded.forEach(identity => {
          if (identity.id === message.address.bot.id) {
            this.bot.beginDialog(message.address, LoginSkill.Dialogs.Login);
          }
        });
      }
    });

    //Initiate welcome dialog if added
    this.bot.on("contactRelationUpdate", message => {
      if (message.action === "add") {
        this.bot.beginDialog(message.address, LoginSkill.Dialogs.Login);
      }
    });
  }

  private registerDialogs() {
    RootSkill.register(this.bot);
    SampleSkill.register(this.bot); // Add a line like this for every dialog
    LoginSkill.register(this.bot); // Add a line like this for every dialog
  }
}
