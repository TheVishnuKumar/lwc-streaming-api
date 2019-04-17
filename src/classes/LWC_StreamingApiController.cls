/**
 * @author Vishnu Kumar
 * @email vishnukumarramawat@gmail.com
 * @desc This class is used on streaming api LWC.
*/
public class LWC_StreamingApiController {

    /**
    * @author Vishnu Kumar
    * @email vishnukumarramawat@gmail.com
    * @desc This methods retuen the curent user session id.
    */
    @AuraEnabled
    public static string getSessionId() {
        return UserInfo.getSessionId();
    }
}