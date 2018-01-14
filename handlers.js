'use strict';
function buildSpeechletResponse(title,output,repromptText,shouldEndSession){
    return {
        outputSpeech:{
            type:'PlainText',
            text:output
        },
        card:{
            type:'Simple',
            title:`SessionSpeechlet - ${title}`,
            content:`SessionSpeechlet -${output}`
        },
        reprompt:{
            outputSpeech:{
                type:'PlainText',
                text:repromptText
            },
        },
        shouldEndSession,
    }
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse
    };
}

//Welcome message
function getWelcomeResponse(callback) {
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = 'Welcome to Naukri.' +
        'Please tell me your best job skill you have by saying, I am good at Java';
    const repromptText = 'Please tell me your best job skill you have by saying, ' +
        'I am good at Java';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}
//En of session
function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Thank you for using Naukri. Have a nice day!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function createBestSkillAttributes(skill) {
    return {
        skill
    };
}

function setSkillInSession(intent, session, callback) {
    const cardTitle = intent.name;
    const bestSkillSlot = intent.slots.Skill;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = false;
    let speechOutput = '';

    if (bestSkillSlot) {
        const bestSkill = bestSkillSlot.value;
        sessionAttributes = createBestSkillAttributes(bestSkill);
        speechOutput = `I now know you have expertise in ${bestSkill}. You can ask me ` +
            "your best job matches by asking, what are latest jobs?";
        repromptText = "You can ask me your best matched jobs by, what jobs are available?";
    } else {
        repromptText = "I'm not sure I understood your best skill. You can tell me your " +
            'best skill by saying, I am good at python';
    }

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function getJob(intent, session, callback) {
    let favoriteColor;
    const repromptText = null;
    const sessionAttributes = {};
    let shouldEndSession = false;
    let speechOutput = '';

    if (session.attributes) {
        favoriteColor = session.attributes.skill;
    }

    if (favoriteColor) {
        speechOutput = `Your best skill is ${favoriteColor}. We have 10 jobs for you. Goodbye.`;
        shouldEndSession = true;
    } else {
        speechOutput = "I'm not sure I understood your best skill. You can tell me your " +
            'best skill by saying, I am good at python';
    }

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
        buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}

function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if (intentName === 'MySkillIsIntent') {
        setSkillInSession(intent, session, callback);
    } else if (intentName === 'WhatAreMyJobsIntent') {
        getJob(intent, session, callback);
    } else if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw new Error('Invalid intent');
    }
}

exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             callback('Invalid Application ID');
        }
        */

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                callback(null, buildResponse(sessionAttributes, speechletResponse));
        });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                callback(null, buildResponse(sessionAttributes, speechletResponse));
        });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};

module.exports = handlers;