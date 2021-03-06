import builder = require("botbuilder");

import { RootSkill } from "./Skills/Root/Root.Skill";
import { LoginSkill } from "./Skills/Login/Login.Skill";
import { StartSkill } from "./Skills/Start/Start.Skill";

import config = require("./helpers/config");

export class BotWrapper {
  /**
     * Connector to use
     * @type {(builder.ConsoleConnector | builder.ChatConnector)}
     * @memberOf Bot
     */
  public bot: builder.UniversalBot;
  private recognizer: builder.LuisRecognizer;

  constructor(public connector: builder.IConnector) {
    this.bot = new builder.UniversalBot(connector);
    this.setUp();

    const app_id = config.microsoft.app_id;
    console.log(!app_id ? "WARNING: Starting bot without ID or Secret" : `Bot started with App Id ${app_id}`);

    this.registerSkills();
    this.init();
  }

  private setUp() {
    console.log("Setting up...");
    const url = config.luis.url.replace("##APP##", config.luis.app).replace("##KEY##", config.luis.key);
    console.log("LUIS URL:", url);
    this.recognizer = new builder.LuisRecognizer(url);
    this.bot.recognizer(this.recognizer);
  }

  private init() {
    console.log("Initializing...");
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

  private registerSkills() {
    console.log("Registering skills...");
    RootSkill.register(this); // Add a line like this for every skill
    StartSkill.register(this);
    LoginSkill.register(this);
  }
}
