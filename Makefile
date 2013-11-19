# Used to tell make to always execute deploy.
# http://www.gnu.org/software/make/manual/html_node/Phony-Targets.html
.PHONY : deploy

deploy:
	ssh do -tC "/bin/bash /srv/all-seeing-eye/ase/deploy.sh"
