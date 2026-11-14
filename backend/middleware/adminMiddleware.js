const adminMiddleware = (req, res, next) => {
    try{
        if(!req.user){
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not authenticated"
            });
        }

        if(req.user.role !== "admin"){
            return res.status(403).json({
                success: false,
                message: "Forbidden: User is not an admin"
            });
        }


        next();

    }

    catch(error){

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
}

module.exports = adminMiddleware;