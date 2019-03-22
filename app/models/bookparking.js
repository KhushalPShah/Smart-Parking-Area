const mongoose = require('mongoose');
const BookParkingSchema = mongoose.Schema({
    siteId : {
        type : String,
        required : true
    },
    AllotedSlot:{
        type : String,
        required : true
    },
    From : {
        type : Number,
        required : true
    },
    To : {
        type : Number,
        required : true
    }
});
const BookParking = module.exports = mongoose.model("BookParking",BookParkingSchema);

module.exports.bookSlot = function(newBookParking,callback)
{
    newBookParking.save(callback);
}
module.exports.getBookedSlots = function(callback)
{
    BookParking.find(callback)
}
module.exports.getBookedSlotBySiteId = function(id,utc_from,utc_to,callback)
{
    const query = { $and : [{siteId : id} , { $or : [{ $and : [{From : {$lte : utc_from}},{To : {$gte : utc_from}}]},{ $and : [{From : {$lte : utc_to}}, {To : {$gte : utc_to}}] }]}] };
    BookParking.find(query,callback);
}