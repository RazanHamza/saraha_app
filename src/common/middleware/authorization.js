

export const authorization = (roles=[])=>{
     return async (req, res, next) => {
        if(!roles.includes(req.user.role)){
              throw new Error("you are not authorized to access this route", { cause: 401});
        }

   next();
};
}