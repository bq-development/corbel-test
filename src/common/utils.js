(function(){
  corbelTest.utils = {};
  corbelTest.utils.unsetDates = function(object) {
    delete object._createdAt;
    delete object._updatedAt;
    return object;
  };
})();
