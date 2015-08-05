(function(){
  corbelTest.resources = {};
  corbelTest.resources.unsetDates = function(object) {
    delete object._createdAt;
    delete object._updatedAt;
    return object;
  };
})();
