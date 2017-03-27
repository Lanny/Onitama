;(function() {
  function wrap(d3) {
    function extractTagType(selector) {
      var els = selector.split(/[> ]/g),
        tag = els[els.length-1],
        tagName = tag.split(/[#\.]/)[0];

      return tagName;
    }

    function rectify(parent, selector, data, applyProps) {
      var elements = parent
        .selectAll(selector)
        .data(data);

      elements
        .exit()
        .remove();

      var enterSelection = elements
        .enter()
        .append(extractTagType(selector));

      applyProps(enterSelection);
      applyProps(elements);
    }

    return { rectify };
  }

  define(['d3'], wrap)
})();

