/**
 * @author Vishnu Kumar
 * @email vishnukumarramawat@gmail.com
 * @desc This JS Provide functionality to create streaming api connections.
*/
import { LightningElement,api } from 'lwc';
import getSessionId from '@salesforce/apex/LWC_StreamingApiController.getSessionId';
import { loadScript } from 'lightning/platformResourceLoader';
import cometdStaticResource from '@salesforce/resourceUrl/cometd';

export default class Lwc_streaming_api extends LightningElement {
    //Channle Name
    @api channel;

    //Override the version of api to use cometd. By default it will use 45.
    @api apiVersion = '45.0';

    //If true then user can see console logs with data.
    @api debug = false;

    cometd;
    subscription;

    connectedCallback(){
        this.loadCometdScript();
    }

    /**
     * @author Vishnu Kumar
     * @email vishnukumarramawat@gmail.com
     * @desc Loads the cometd static resource.
    */
    loadCometdScript(){
        if( !this.subscription ){
            Promise.all([
                loadScript(this, cometdStaticResource + '/cometd.js')
            ])
            .then(() => {
                this.loadSessionId();
            })
            .catch(error => {
                let message = error.message || error.body.message;
                this.fireErrorEvent(message);
            });
        }
        else{
            this.fireErrorEvent('Subscription already exists.');
            this.consoleLog('(LWC Streaming API) Error: Subscription already exists.');
        }
    }

    /**
     * @author Vishnu Kumar
     * @email vishnukumarramawat@gmail.com
     * @desc Loads the session id and create a connection with cometd.
    */
    loadSessionId(){
        getSessionId()
        .then(sessionId => {
            this.consoleLog('(LWC Streaming API) Session ID: '+sessionId);

            //Initiating Cometd 
            this.cometd = new window.org.cometd.CometD();

            //Configuring Cometd
            this.cometd.configure({
                url: window.location.protocol + '//' + window.location.hostname + '/cometd/'+this.apiVersion+'/',
                requestHeaders: { Authorization: 'OAuth ' + sessionId},
                appendMessageTypeToURL : false
            });
            this.cometd.websocketEnabled = false;

            //Initiating Cometd Handshake
            this.cometd.handshake( (status) => {
                if (status.successful) {
                    this.consoleLog('(LWC Streaming API) Handshake Successful on : '+ this.channel );
                    this.consoleLog('(LWC Streaming API) Handshake Status: '+ JSON.stringify(status) );

                    //Subscribe to channel
                    this.subscription = this.cometd.subscribe( this.channel , (message) => {
                        this.consoleLog('(LWC Streaming API) Message: '+ JSON.stringify(message) );
                        this.fireMessageEvent(message);
                    });
                }
                else{
                    this.consoleLog('(LWC Streaming API) Error in Handshake: '+ JSON.stringify(status) );
                    this.fireErrorEvent(status);
                }
            });

        })
        .catch(error => {
            let message = error.message || error.body.message;
            this.fireErrorEvent('Error: '+ message);
        });
    }

    /**
     * @author Vishnu Kumar
     * @email vishnukumarramawat@gmail.com
     * @desc Fire the error event.
    */
    fireErrorEvent(logMsg){
        this.dispatchEvent( 
            new CustomEvent('error', {
                detail: {error: logMsg}
            })
        );
    }

    /**
     * @author Vishnu Kumar
     * @email vishnukumarramawat@gmail.com
     * @desc Fire the Payload/Message event.
    */
    fireMessageEvent(payload){
        this.dispatchEvent( 
            new CustomEvent('message', {
                detail: {payload: payload}
            })
        );
    }

    /**
     * @author Vishnu Kumar
     * @email vishnukumarramawat@gmail.com
     * @desc Destroy the connection with channel.
    */
    @api
    unsubscribe(){
        //Unsubscribing Cometd
		this.cometd.unsubscribe( this.subscription, {}, (unsubResult) => {
            
            if( unsubResult.successful ) {
                this.consoleLog('(LWC Streaming API) unsubscribed successfully.');

                //Disconnecting Cometd
                this.cometd.disconnect((disResult) => { 
                    if(disResult.successful) {
                        this.consoleLog('(LWC Streaming API) disconnected.');
                    }
                    else{
                        this.consoleLog('(LWC Streaming API) disconnection unsuccessful.');                
                    }
                });
            }
            else{
                this.consoleLog('(LWC Streaming API) unsubscription failed.');
            }
        });
        
        this.subscription = undefined;
    }

    /**
     * @author Vishnu Kumar
     * @email vishnukumarramawat@gmail.com
     * @desc Reinitialize the connection with channel.
    */
    @api
    subscribe(){
        this.loadCometdScript();
    }

    /**
     * @author Vishnu Kumar
     * @email vishnukumarramawat@gmail.com
     * @desc Return true is connection is not destroyed.
    */
    @api
    checkConnection(){
        if( this.subscription ){
            return true;
        }

        return false;
    }

    /**
     * @author Vishnu Kumar
     * @email vishnukumarramawat@gmail.com
     * @desc Print console logs if debug is turned on.
    */
    consoleLog(msg){
        if( this.debug ){
            console.log(msg);
        }
    }
}