import copy

class Element(object):
    def render(self):
        lst = []
        self.render_unto_list(lst)
        return "".join(lst)
    def attr(self, key, value=None):
        result = copy.copy(self)
        if value is None:
            result.attrs.update(key)
        else:
            result.attrs[key] = value
        return result
    def add_child(self, child):
        result = copy.copy(self)
        result.children.append(child)
        return result
    def call(self, f):
        return f(self)

class CData(Element):
    replacements = [('"', "&quot;"),
                    ('&', "&amp;"),
                    ('<', "&lt;"),
                    ('>', "&gt;")]
    def __init__(self, content):
        for k, v in self.replacements:
            content = content.replace(k, v)
        self.content = content
    def render_unto_list(self, lst):
        lst.append(self.content)

class UnescapedText(Element):
    def __init__(self, content):
        self.content = content
    def render_unto_list(self, lst):
        lst.append(self.content)

def tag(name, preappend=[]):
    class Tag(Element):
        def __init__(self, *children, **attrs):
            self.children = [CData(child) if type(child) == str or type(child) == unicode
                             else child
                             for child in children]
            self.attrs = attrs
        def render_unto_list(self, lst):
            def rep(k, v):
                if v == True:
                    return k
                else:
                    return "%s='%s'" % (k, v)
            lst.extend(preappend)
            lst.append("<" + name +
                       (" " if len(self.attrs) else '' ) +
                       " ".join(rep(k, v) for (k, v) in self.attrs.iteritems()) + ">")
            def do_it(children):
                for child in children:
                    if type(child) == list:
                        do_it(child)
                    elif child is not None:
                        child.render_unto_list(lst)
            do_it(self.children)
            # for child in self.children:
            #     if child is not None:
            #         child.render_unto_list(lst)
            lst.append("</" + name + ">")
    return Tag

class BrClass(Element):
    def render_unto_list(self, lst):
        lst.append("<br>")

class HrClass(Element):
    def render_unto_list(self, lst):
        lst.append("<hr>")

##############################################################################

nbsp = UnescapedText("&nbsp;")
br = BrClass()
hr = HrClass()
span = tag("span")
div = tag("div")
html = tag("html", "<!doctype html>\n")
head = tag("head")
meta = tag("meta")
script = tag("script")
title = tag("title")
body = tag("body")
p = tag("p")
b = tag("b")
form = tag("form")
input = tag("input")
table = tag("table")
tbody = tag("tbody")
tr = tag("tr")
td = tag("td")
th = tag("th")
button = tag("button")
link = tag("link")
h1, h2, h3, h4, h5, h6 = [tag(v) for v in ["h1", "h2", "h3", "h4", "h5", "h6"]]
nav = tag("nav")
a = tag("a")
ul, ol, li = [tag(v) for v in ["ul", "ol", "li"]]
label = tag("label")
