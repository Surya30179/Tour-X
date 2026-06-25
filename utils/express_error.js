class Express_Error extends Error{
    constructor(message,status_code){
        super(message);
        this.status_code=status_code;
    }
}

module.exports=Express_Error