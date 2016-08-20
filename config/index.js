/*
 * Please refer to the dev.sample.json file.
 * Copy this file and create a new file named "dev.private.json".
 * Fill in the details for the features you'de like to support.
 * You don't have to fill in all settings, but leave those you're not using blank.
*/

var nconf = require('nconf');
var path = require('path');

var env = path.join(__dirname, 'dev.private.json')

var nconfig = nconf.env().file({ file: env });


// This is the main configuration file which helps you turn on and off some of the features
// supported in this example.
// To turn on any feature, please provide the relevant configuration details below.
// Not providing the neccessary configuration details will result in a feature being disabled.


// Authentication
// --------------
// only enabled if below details were provided
//
// Google's client Id
var auth_google_client_id = nconfig.get('GOOGLE_CLIENT_ID');
//
// Google's client secret
var auth_google_client_secret = nconfig.get('GOOGLE_CLIENT_SECRET');
//
// Google's callback URL. Use the following format:
// for local: http://localhost:3000/.auth/login/google/callback
// for remote: http://yourWebAppUrl/.auth/login/google/callback
var auth_google_callback_url = nconfig.get('GOOGLE_CALLBACK_URL');


// Authorization
// -------------
// only enabled if authentication details were provided above in addition to the following:
//
// this should be your google email address for the account that
// will manage the permissions for accessing the console.
// not providing this value will not enforce authorization, and
// everyone will be able to access the console, after authenticating with Google.
var auth_google_admin_account = nconfig.get('GOOGLE_ADMIN_ACCOUNT');
//
// storage will be used to keep users list in an Azure table.
// not providing these details will result in disabling the users / authorization feature 
//
// azure storage account name
var storage_account = nconfig.get('STORAGE_ACCOUNT');
//
// azure storage acount key
var storage_account_key = nconfig.get('STORAGE_KEY');


// Logging
// -------
// this configuration is used by the azure-logging module to maintain application logs.
// using the log command, you'll be able to query for the application logs in the console.
// not providing the below information will result in disabling this feature.

// log azure storage account name
var log_storage_account = nconfig.get('LOG_STORAGE_ACCOUNT');
//
// log azure storage acount key
var log_storage_account_key = nconfig.get('LOG_STORAGE_KEY');
//
// log enabled
var log_enabled = (nconfig.get('LOG_ENABLED') || '').toString().toLowerCase() === 'true';


// Bot
//
// handle name
var bot_iframe_handle = nconfig.get('BOT_IFRAME_HANDLE');
//
// secret
var bot_iframe_secret = nconfig.get('BOT_IFRAME_SECRET');
//
// app Id
var bot_app_id = nconfig.get('BOT_APP_ID');

// DOCUMENTDB
 
var documentdb_accounr_url = nconfig.get('DOCUMENTDB_ACCOUNT_URL');
var documentdb_master_key = nconf.get('DOCUMENTDB_MASTER_KEY');

var config = {
    auth: {
        google: {
            clientID: auth_google_client_id,
            clientSecret: auth_google_client_secret,
            callbackURL: auth_google_callback_url,
            adminAccount: auth_google_admin_account,
            enabled: auth_google_client_id && auth_google_client_secret && auth_google_callback_url ? true : false
        }
    },

    storage: {
        account: storage_account,
        key: storage_account_key,
        enabled: storage_account && storage_account_key ? true : false
    },
    
    log: {
        // minimum level to show logs
        level: nconfig.get('LOG_LEVEL') || 'log',

        // supported transporters for the application logs.
        // currently redirecting logs to both the console and Azure storage
        transporters: [
        {
            name: 'console', 
            write : true, 
            default: false,
            options: {
                level: 'log'
            }
        },
        {
            name: 'azuretable',
            write: true,
            default: true,
            options: {
                storage: {
                    account: log_storage_account,
                    key: log_storage_account_key
                }
            }
        }],

        enabled: log_enabled && log_storage_account && log_storage_account_key ? true : false
      },
      apps: {
        console: { name: 'console', desc: 'the command line console web app' },
        airbots: { name: 'bot', desc: 'the graph bot service' }
      },
      bot: {
        appId: bot_app_id,
        webchat: {
            handle: bot_iframe_handle,
            secret: bot_iframe_secret
        }
      },
      documentdb: {
          account_url:documentdb_accounr_url,
          master_key:documentdb_master_key
      }
};

config.users = {
    enabled: config.auth.google.enabled && config.auth.google.adminAccount && config.storage.enabled ? true : false
}

module.exports = config;