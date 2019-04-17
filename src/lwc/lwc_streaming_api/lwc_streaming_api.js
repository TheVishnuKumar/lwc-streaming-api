import { LightningElement,api } from 'lwc';
import getSessionId from '@salesforce/apex/LWC_StreamingApiController.getSessionId';
import { loadScript } from 'lightning/platformResourceLoader';
import cometdStaticResource from '@salesforce/resourceUrl/cometd';

export default class Lwc_streaming_api extends LightningElement {
    @api channel;
    @api apiVersion = '45.0';
    @api debug = false;

    cometd;
    subscription;

    connectedCallback(){
        this.loadCometdScript();
    }

    loadCometdScript(){
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
            this.fireErrorEvent(message);
        });
    }

    fireErrorEvent(logMsg){
        this.dispatchEvent( 
            new CustomEvent('error', {
                detail: {message: logMsg}
            })
        );
    }

    fireMessageEvent(payload){
        this.dispatchEvent( 
            new CustomEvent('message', {
                detail: {payload: payload}
            })
        );
    }

    @api
    destroy(){
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
    }

    consoleLog(msg){
        if( this.debug ){
            console.log(msg);
        }
    }
}