#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { checkCommand } from "./commands/check.js";
import { updateCommand } from "./commands/update.js";

const program = new Command();

program
  .name("tpl")
  .description("Template Platform CLI")
  .version("0.1.0");

program.addCommand(initCommand);
program.addCommand(checkCommand);
program.addCommand(updateCommand);

program.parse(process.argv);