API_URL:="http://localhost:3000/api/v1"
YEAR:=2024
CURRENT_VERSION:=3.7.8
NEWS_LINK:="https://forum.vassalengine.org/t/vassal-3-7-8-released/78867"

JINJA_ARGS:=-Dapi_url=${API_URL} -Dyear=${YEAR} -Dcurrent_version=${CURRENT_VERSION} -Dnews_link=${NEWS_LINK}

ALL:=site/projects.html site/project.html

all: $(ALL)

clean:
	$(RM) $(ALL) 

.PHONY: all clean

site/%.html: templates/%.html templates/base.html
	jinja2 ${JINJA_ARGS} $< -o $@
